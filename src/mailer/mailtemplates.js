function otpTemplate(otp) {
  return `
    <div style="max-width: 600px; margin: auto; padding: 40px; background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; font-family: Arial, sans-serif; color: #333;">
        <h2 style="text-align: center; color: #222;">Your Verification Code</h2>
        <p style="font-size: 16px; line-height: 1.5; text-align: center;">Use the OTP below to complete your action. This code is valid for the next 5 minutes.</p>
    
        <div style="margin: 30px auto; padding: 20px; width: fit-content; background: #ffffff; border: 1px dashed #ccc; border-radius: 6px;">
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 0; color: #000;">
            ${otp}
          </p>
        </div>
    
        <p style="font-size: 14px; text-align: center; color: #777;">Didn’t request this code? You can safely ignore this email.</p>
    
        <p style="font-size: 14px; text-align: center; color: #aaa; margin-top: 30px;">&mdash; © 2025 NexaEase. All rights reserved.</p>
    </div>
    `;
}

function contactFormTemplate(email, inquiry) {
  return `
    <div style="padding: 30px; font-family: Arial, sans-serif; background: #ffffff; color: #333; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #e0e0e0;">
      <h2 style="text-align: center; color: #222; margin-bottom: 20px;">Thank You for Contacting NexaEase</h2>
      <p style="font-size: 15px;">Hi <strong>${inquiry.name}</strong>,</p>
      <p style="font-size: 14px; color: #555;"><strong>Your Email:</strong> ${email}</p>
      <p style="font-size: 15px;">We have received your message and will get back to you shortly. Here’s a copy of your message:</p>
      <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #007BFF; margin: 20px 0; border-radius: 5px;">
        <p style="margin: 0; font-size: 14px; color: #555;"><strong>Your Message:</strong></p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #333;">${inquiry.message}</p>
      </div>
      <p style="font-size: 14px;">We appreciate your time and will respond as soon as possible.</p>
      <p style="margin-top: 40px; text-align: center;">
        <a href="${process.env.SERVER_ADDRESS}" style="padding: 10px 20px; background: #007BFF; color: #fff; text-decoration: none; border-radius: 4px; font-size: 14px;">Visit NexaEase</a>
      </p>
      <p style="margin-top: 30px; font-size: 12px; color: #aaa; text-align: center;">&copy; 2025 NexaEase. All rights reserved.</p>
    </div>
  `;
}


function orderPlacedTemplate(order) {
  const { orderNumber, createdAt, total, items } = order;

  return `
    <div style="max-width:600px;margin:20px auto;padding:30px;background:#ffffff;border:1px solid #e0e0e0;border-radius:8px;font-family:Arial,sans-serif;color:#333;">
      <div style="text-align:center;">
        <img src="https://i.ibb.co/fdrJ4Gkz/nexa-ease-logo-transparent.png" alt="NexaEase Logo" style="width:120px;margin-bottom:20px;">
        <h2 style="color:#222;margin-bottom:10px;">Order Confirmation</h2>
        <p style="font-size:16px;line-height:1.5;margin-bottom:30px;">Thank you for your purchase! Your order has been placed successfully. Here are the details:</p>
      </div>
    
      <div style="background:#f9f9f9;padding:20px;border-radius:6px;border:1px solid #ddd;">
        <p style="margin:0;font-size:16px;"><strong>Order ID:</strong> ${orderNumber}</p>
        <p style="margin:0;font-size:16px;"><strong>Order Date:</strong> ${createdAt}</p>
        <p style="margin:0;font-size:16px;"><strong>Total Amount:</strong> $${total}</p>
      </div>
    
      <h3 style="margin-top:30px;color:#222;">Order Summary</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;font-size:15px;">Product</th>
            <th style="text-align:center;padding:8px;border-bottom:1px solid #ddd;font-size:15px;">Qty</th>
            <th style="text-align:right;padding:8px;border-bottom:1px solid #ddd;font-size:15px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items
      .map(
        (item) => `
            <tr>
              <td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:14px;">${item.p_name}</td>
              <td style="padding:8px;text-align:center;border-bottom:1px solid #f0f0f0;font-size:14px;">${item.quantity}</td>
              <td style="padding:8px;text-align:right;border-bottom:1px solid #f0f0f0;font-size:14px;">$${item.price}</td>
            </tr>
            `
      )
      .join('')}
        </tbody>
      </table>
        
      <p style="font-size:14px;color:#555;margin-top:30px;">You will receive another email when your order is shipped.</p>
        
      <div style="margin-top:40px;text-align:center;">
        <a href="${process.env.SERVER_ADDRESS}/account/orders" style="padding:10px 20px;background:#007BFF;color:#fff;text-decoration:none;border-radius:4px;font-size:14px;">View Your Order</a>
      </div>
        
      <p style="font-size:12px;color:#aaa;text-align:center;margin-top:20px;">&copy; 2025 NexaEase. All rights reserved.</p>
    </div>
  `;
}


module.exports = { otpTemplate, contactFormTemplate, orderPlacedTemplate };
