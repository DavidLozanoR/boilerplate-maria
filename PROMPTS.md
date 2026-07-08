# PROMPTS.md

Documenta los prompts que utilizaste para las siguientes tareas. Sigue la estructura indicada para cada uno.

---

## Prompt 1: Generación de datos de prueba

**Tarea:** Generar 10 registros realistas para la tabla de contratos (nombre, apellidos, teléfono, email, fecha_reserva, status).

### Contexto dado a la IA
Se le proporcionó el motor de base de datos objetivo (SQLite), la estructura exacta de la tabla y las restricciones de negocio para cada columna (como el formato de fecha y los valores exactos permitidos para el status).

### Prompt
"Actúa como un desarrollador backend y analista de datos. Genera un bloque de código SQL con 10 sentencias INSERT realistas para una tabla contratos en SQLite. Los campos a llenar son: nombre (texto), apellidos (texto), telefono (string numérico de 10 dígitos), email (formato de correo válido), fecha_reserva (formato YYYY-MM-DD, fechas obligatoriamente en el futuro), y status (los únicos valores permitidos son: 'Pendiente de firma', 'Firmado', 'Cancelado'). Asegúrate de que los datos parezcan reales, orientados a clientes hispanohablantes de un hotel, y no uses caracteres que puedan romper la sintaxis SQL."

### Por qué lo estructuraste así
Se estructuró utilizando el patrón de "Asignación de Rol" y "Restricciones de Salida". Al especificar explícitamente el motor de base de datos y las reglas de negocio (fechas futuras y valores exactos del ENUM simulado), se evita que la IA genere datos que causen errores de validación en la API de nuestro sistema.

### Segunda iteración (si aplica)
No fue necesaria.

### Resultado obtenido

INSERT INTO contratos (nombre, apellidos, telefono, email, fecha_reserva, status) VALUES 
('Carlos', 'Ramírez Soto', '5512345678', 'carlos.ramirez@email.com', '2026-08-15', 'Firmado'),
('Laura', 'Gómez Hernández', '5598765432', 'laura.gomez@email.com', '2026-09-01', 'Pendiente de firma'),
('Miguel', 'Álvarez Vargas', '5523456789', 'malvarez.v@email.com', '2026-08-20', 'Cancelado'),
('Sofía', 'López Cruz', '5587654321', 'sofia.lopez.c@email.com', '2026-10-12', 'Firmado'),
('Alejandro', 'Ruiz Morales', '5534567890', 'alejandro.rm@email.com', '2026-11-05', 'Pendiente de firma'),
('Valentina', 'Castillo Reyes', '5576543210', 'val_castillo@email.com', '2026-08-30', 'Firmado'),
('Diego', 'Mendoza Aguilar', '5545678901', 'diego.mendoza99@email.com', '2026-09-15', 'Pendiente de firma'),
('Camila', 'Ortiz Silva', '5565432109', 'camila.ortiz.s@email.com', '2026-12-01', 'Firmado'),
('Javier', 'Flores Navarro', '5556789012', 'javier.fn@email.com', '2026-10-25', 'Cancelado'),
('Mariana', 'Jiménez Vega', '5554321098', 'mariana.j.v@email.com', '2026-11-20', 'Pendiente de firma');
---

## Prompt 2: Mensaje de email profesional

**Tarea:** Redactar el cuerpo del email que simula el envío del contrato al huésped (el que actualmente hace `console.log` en `emailService.js`).

### Contexto dado a la IA
Le indiqué que el correo proviene de "MarIA - Hotel Boutique del Mar", el tono corporativo esperado, y las variables dinámicas del objeto contrato que estaban disponibles en el backend de Node.js (nombre, apellidos, status, id, nombre del archivo).

### Prompt
"Actúa como un corporativo. Redacta el cuerpo de un correo electrónico profesional en formato HTML y texto plano para enviar un contrato de reserva a un huésped. El hotel se llama 'MarIA - Hotel Boutique del Mar'. El correo debe agradecer la reserva, indicar el estado actual del documento, mencionar que el contrato va adjunto, e integrarse en una plantilla literal de JavaScript lista para usarse en Nodemailer. Debes inyectar las variables ${contrato.nombre}, ${contrato.apellidos}, ${contrato.status} y ${contrato.id} de la forma más natural posible en el texto."

### Por qué lo estructuraste así
El objetivo principal era evitar el trabajo manual de traducir texto genérico a código. Al solicitar directamente una plantilla literal de JavaScript con las variables ya interpoladas, el código resultado se pudo copiar y pegar directamente dentro del bloque mailOptions de emailService.js sin modificación adicional.

### Segunda iteración (si aplica)
Se solicitó agregar una estructura HTML con estilos en línea que combinara con los colores del frontend corporativo (azules y grises), manteniendo el texto plano como fallback.

### Resultado obtenido
const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #374151; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2563eb; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">MarIA - Hotel Boutique del Mar</h1>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px;">Estimado/a <strong>${contrato.nombre} ${contrato.apellidos}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          Es un placer saludarle. Queremos agradecerle por su preferencia y por confiar en nosotros para su próxima reserva.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6;">
          De acuerdo con su solicitud, hemos generado el contrato correspondiente a su reserva. Lo encontrará <strong>adjunto a este correo</strong> en formato de documento para su revisión.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          El estado actual de su documento es: <span style="background-color: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${contrato.status}</span>.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          Si tiene alguna duda o requiere asistencia adicional, por favor no dude en responder directamente a este correo.
        </p>

        <br>
        <p style="font-size: 16px; margin-bottom: 5px;">Atentamente,</p>
        <p style="font-size: 18px; font-weight: bold; color: #2563eb; margin-top: 0;">El equipo de MarIA</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        Este es un correo generado automáticamente. Por favor, conserve este documento para sus registros.
      </div>
    </div>
  `;