const nodemailer = require('nodemailer');

// Simulated email transport (logs to the console instead of sending)
const transporter = nodemailer.createTransport({
  jsonTransport: true,
});

async function sendContractEmail(contrato) {
  // Compose the email body in HTML
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

  // Plain-text version (as a fallback)
  const textBody = `
Estimado/a ${contrato.nombre} ${contrato.apellidos},

Queremos agradecerle por su preferencia y por confiar en nosotros para su próxima reserva en MarIA - Hotel Boutique del Mar.

Hemos adjuntado a este correo el contrato correspondiente a su reserva para su revisión.
Estado del documento: ${contrato.status}.

Si tiene alguna duda, puede responder a este correo.

Atentamente,
El equipo de MarIA
  `.trim();

  const mailOptions = {
    from: process.env.SMTP_USER || '"MarIA Reservas" <noreply@maria-saas.com>',
    to: contrato.email,
    subject: `Documentación de su reserva - Contrato #${contrato.id}`,
    text: textBody, // Plain-text fallback
    html: htmlBody, // Main HTML version

    // If the contract property contains the file name, attach it as a simulated contract document
    attachments: contrato.contrato ? [
      {
        filename: contrato.contrato,
        path: path.join(__dirname, '../../contracts', contrato.contrato)
      }
    ] : []
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('\n=============================================');
    console.log('[EMAIL SIMULADO ENVIADO EXITOSAMENTE]');
    console.log(`Para: ${contrato.email}`);
    console.log(`Asunto: ${mailOptions.subject}`);
    console.log(`Adjuntos: ${mailOptions.attachments.length > 0 ? mailOptions.attachments[0].filename : 'Ninguno'}`);
    console.log('=============================================\n');
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[ERROR AL ENVIAR EMAIL]:', error);
    throw new Error('No se pudo simular el envío del correo');
  }
}
module.exports = { sendContractEmail };
