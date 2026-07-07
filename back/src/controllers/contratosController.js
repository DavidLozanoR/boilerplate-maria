const db = require('../database/db');
const { sendContractEmail } = require('../services/emailService');
const { generateContractFile } = require('../services/fileService');
const Joi = require('joi');

const contratoSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  apellidos: Joi.string().min(2).max(100).required(),
  telefono: Joi.string().min(6).max(20).required(),
  email: Joi.string().email().required(),
  fecha_reserva: Joi.string().isoDate().required(),
});

function getContratos(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const total = db.prepare('SELECT COUNT(*) as count FROM contratos').get().count;
  const contratos = db.prepare('SELECT * FROM contratos ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);

  res.json({
    data: contratos,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

function getContrato(req, res) {
  const { id } = req.params;

  // TODO: Bug #2 - N+1 query problem: this runs an extra unnecessary query
  // Fix: just use the single query below and return contrato directly
  const contrato = db.prepare('SELECT * FROM contratos WHERE id = ?').get(id);

  if (!contrato) {
    return res.status(404).json({ error: 'Contrato no encontrado', status: 404 });
  }


  res.json(contrato); //Fix: return contrato directly without running an extra query
}

function createContrato(req, res) {
  const { error, value } = contratoSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message, status: 400 });
  }

  const { nombre, apellidos, telefono, email, fecha_reserva } = value;

  const stmt = db.prepare(`
    INSERT INTO contratos (nombre, apellidos, telefono, email, fecha_reserva, status)
    VALUES (?, ?, ?, ?, ?, 'Pendiente de firma')
  `);

  const result = stmt.run(nombre, apellidos, telefono, email, fecha_reserva);
  const newContrato = db.prepare('SELECT * FROM contratos WHERE id = ?').get(result.lastInsertRowid);

  const filename = generateContractFile(newContrato);
  db.prepare('UPDATE contratos SET contrato = ? WHERE id = ?').run(filename, newContrato.id);

  sendContractEmail({ ...newContrato, contrato: filename });

  res.status(201).json({ ...newContrato, contrato: filename });
}

function updateContrato(req, res) {
  const { id } = req.params;
  const { error, value } = contratoSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message, status: 400 });
  }

  const contrato = db.prepare('SELECT * FROM contratos WHERE id = ?').get(id);
  if (!contrato) {
    return res.status(404).json({ error: 'Contrato no encontrado', status: 404 });
  }

  const { nombre, apellidos, telefono, email, fecha_reserva } = value;
  db.prepare(`
    UPDATE contratos SET nombre=?, apellidos=?, telefono=?, email=?, fecha_reserva=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(nombre, apellidos, telefono, email, fecha_reserva, id);

  const updated = db.prepare('SELECT * FROM contratos WHERE id = ?').get(id);
  res.json(updated);
}

function deleteContrato(req, res) {
  const { id } = req.params;
  const contrato = db.prepare('SELECT * FROM contratos WHERE id = ?').get(id);

  if (!contrato) {
    return res.status(404).json({ error: 'Contrato no encontrado', status: 404 });
  }

  db.prepare('DELETE FROM contratos WHERE id = ?').run(id);
  res.json({ message: 'Contrato eliminado', status: 200 });
}

function reenviarContrato(req, res) {
  const { id } = req.params;
  const contrato = db.prepare('SELECT * FROM contratos WHERE id = ?').get(id);

  if (!contrato) {
    return res.status(404).json({ error: 'Contrato no encontrado', status: 404 });
  }

  sendContractEmail(contrato);
  res.json({ message: 'Email reenviado', status: 200 });
}

function firmarContrato(req, res) {
  const { id } = req.params;
  const contrato = db.prepare('SELECT * FROM contratos WHERE id = ?').get(id);

  if (!contrato) {
    return res.status(404).json({ error: 'Contrato no encontrado', status: 404 });
  }

  db.prepare("UPDATE contratos SET status='Firmado', updated_at=CURRENT_TIMESTAMP WHERE id=?").run(id);
  const updated = db.prepare('SELECT * FROM contratos WHERE id = ?').get(id);
  res.json(updated);
}

function cancelarContrato(req, res) {
  const { id } = req.params;
  const contrato = db.prepare('SELECT * FROM contratos WHERE id = ?').get(id);

  if (!contrato) {
    return res.status(404).json({ error: 'Contrato no encontrado', status: 404 });
  }

  db.prepare("UPDATE contratos SET status='Cancelado', updated_at=CURRENT_TIMESTAMP WHERE id=?").run(id);
  const updated = db.prepare('SELECT * FROM contratos WHERE id = ?').get(id);
  res.json(updated);
}

module.exports = {
  getContratos,
  getContrato,
  createContrato,
  updateContrato,
  deleteContrato,
  reenviarContrato,
  firmarContrato,
  cancelarContrato,
};
