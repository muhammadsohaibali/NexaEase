function otpTemplate(otp) {
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif;">
      <!-- Gradient Border Effect -->
      <div style="background-color: #111827; padding: 2px; border-radius: 12px;">
        <!-- Main Container -->
        <div style="background: #ffffff; border-radius: 10px; overflow: hidden;">
          <!-- Header -->
          <div style="padding: 40px 20px 20px; text-align: center; background: linear-gradient(135deg, #f9fafb, #ffffff);">
            <img src="https://i.ibb.co/fdrJ4Gkz/nexa-ease-logo-transparent.png" alt="NexaEase" style="height: 48px; width: auto; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">Secure Verification Code</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px 40px;">
            <p style="font-size:16px;line-height:1.6;color:#4b5563;text-align:center;margin-bottom:30px;max-width: 80%;margin: 0 auto 30px auto;">
              For your security, please use this one-time passcode to verify your identity.
              <br><strong style="color: #111827;">Expires in 5 minutes</strong>.
            </p>
            
            <!-- OTP Display -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 0 auto 30px; max-width: 300px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);">
              <div style="letter-spacing: 10px; font-size: 36px; font-weight: 700; color: #111827; text-align: center; padding: 10px 0;-webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                ${otp}
              </div>
            </div>
            
             <!-- Security Notice -->
            <div style="background: #fef2f2; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 30px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #b91c1c; font-weight: 500;">
                Never share this code with anyone
              </p>
              <p style="margin: 0; font-size: 14px; color: #b91c1c; font-weight: 500;">
                NexaEase will never ask for it
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="padding: 20px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              If you didn't request this, please ignore this email.
              <br><span style="color: #9ca3af;">© 2025 NexaEase. All rights reserved.</span>
            </p>
          </div>
        </div>
      </div>
      
      <!-- Watermark -->
      <p style="font-size: 11px; text-align: center; color: #d1d5db; margin-top: 20px;">
        Secured with NexaEase Authentication
      </p>
    </div>
  `;
}


function contactFormTemplate(email, message, name) {
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif;">
      <!-- Gradient Border Container -->
      <div style="background: linear-gradient(90deg, #4f46e5, #7c3aed); padding: 2px; border-radius: 12px;">
        <!-- Main Content Card -->
        <div style="background: #ffffff; border-radius: 10px; overflow: hidden;">
          <!-- Header with Logo -->
          <div style="padding: 30px 20px; text-align: center; background: linear-gradient(135deg, #f9fafb, #ffffff);">
            <img src="https://i.ibb.co/fdrJ4Gkz/nexa-ease-logo-transparent.png" alt="NexaEase" style="height: 40px; width: auto; margin-bottom: 15px;">
            <h2 style="margin: 0; font-size: 22px; font-weight: 600; color: #111827;">Thank You for Contacting Us</h2>
          </div>
          
          <!-- Message Content -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 20px;">
              Hi <strong style="color: #1e293b;">${name}</strong>,
            </p>
            
            <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin-bottom: 25px;">
              We've received your message and our team will get back to you shortly. 
              Here's what you sent us:
            </p>
            
            <!-- User Details Card -->
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px; border: 1px solid #e5e7eb;">
              <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: 500; color: #64748b;">YOUR EMAIL</p>
                <p style="margin: 0; font-size: 15px; color: #1e293b; font-weight: 500;">${email}</p>
              </div>
              
              <div>
                <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: 500; color: #64748b;">YOUR MESSAGE</p>
                <p style="margin: 0; font-size: 15px; color: #1e293b; line-height: 1.5;">${message}</p>
              </div>
            </div>
            
            <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin-bottom: 30px;">
              We typically respond within 24 hours. For urgent matters, please call our 
              support line at <strong style="color: #4f46e5;">+92 300 1234567</strong>.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.SERVER_ADDRESS}" target="_blank"
                 style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px; box-shadow: 0 2px 4px rgba(79,70,229,0.2);">
                Visit Our Website
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="padding: 20px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              This is an automated message. Please do not reply directly to this email.
              <br><span style="color: #9ca3af;">© 2025 NexaEase. All rights reserved.</span>
            </p>
          </div>
        </div>
      </div>
      
      <!-- Watermark -->
      <p style="font-size: 11px; text-align: center; color: #d1d5db; margin-top: 20px;">
        Secured with NexaEase Communication
      </p>
    </div>
  `;
}

function orderPlacedTemplate(order) {
  const { orderNumber, createdAt, username, address, phone, total, items } = order;

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif;">
      <!-- Gradient Border Container -->
      <div style="background: linear-gradient(90deg, #4f46e5, #7c3aed); padding: 2px; border-radius: 12px;">
        <!-- Main Content Card -->
        <div style="background: #ffffff; border-radius: 10px; overflow: hidden;">
          <!-- Header with Logo -->
          <div style="padding: 30px 20px; text-align: center; background: linear-gradient(135deg, #f9fafb, #ffffff);">
            <img src="https://i.ibb.co/fdrJ4Gkz/nexa-ease-logo-transparent.png" alt="NexaEase" style="height: 50px; width: auto; margin-bottom: 15px;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">Order Confirmation</h2>
            <p style="font-size: 16px; color: #4b5563; margin-top: 10px;">Thank you for your purchase, ${username}!</p>
          </div>

          <!-- Order Details -->
          <div style="padding: 30px;">

            <!-- Customer Info Card -->
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
              <div style="margin-bottom: 15px;display:flex;flex-direction:row; justify-content: space-between;">
                <div>
                  <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: 500; color: #64748b;">ORDER NUMBER</p>
                  <a href="${process.env.SERVER_ADDRESS}/order/track/?order-id=${orderNumber}" target="_blank" style="margin: 0; font-size: 15px; color: #1e293b; font-weight: 600; text-decoration: none;">${orderNumber}</a>
                </div>
                <div style="margin-left: 20%">
                  <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: 500; color: #64748b;">PLACED ON</p>
                  <p style="margin: 0; font-size: 15px; color: #1e293b;">${createdAt.split('at')[0].trim()}</p>
                </div>
              </div>

              <div style="margin-bottom: 15px;display:flex;flex-direction:row; justify-content: space-between;">
                <div>
                  <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: 500; color: #64748b;">CONTACT</p>
                  <p style="margin: 0; font-size: 15px; color: #1e293b;">${phone}</p>
                </div>
                <div style="margin-left: 20%">
                  <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: 500; color: #64748b;">ADDRESS</p>
                  <p style="margin: 0; font-size: 15px; color: #1e293b;">${address}</p>
                </div>
              </div>
            </div>

            <!-- Total Amount -->
            <div style="background: #ffffff; border-radius: 6px; padding: 15px; text-align: center; margin-bottom: 30px; border: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 13px; font-weight: 500; color: #64748b;">TOTAL AMOUNT</p>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 700; color: #4f46e5;">Rs ${total}</p>
            </div>
            
            <!-- Order Items -->
            <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #111827;">Order Summary</h3>
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f8fafc;">
                    <th style="padding: 12px 15px; text-align: left; font-size: 14px; font-weight: 500; color: #64748b;">Product</th>
                    <th style="padding: 12px 15px; text-align: center; font-size: 14px; font-weight: 500; color: #64748b;">Qty</th>
                    <th style="padding: 12px 15px; text-align: right; font-size: 14px; font-weight: 500; color: #64748b;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(item => `
                    <tr style="border-top: 1px solid #e5e7eb;">
                      <td style="padding: 15px; font-size: 14px; color: #1e293b;">
                        <a href="${process.env.SERVER_ADDRESS}/product/?id=${item.product_id}" target="_blank" style="color: #1e293b; text-decoration: none;">${item.product_name}</a>
                      </td>
                      <td style="padding: 15px; text-align: center; font-size: 14px; color: #1e293b;">${item.quantity}</td>
                      <td style="padding: 15px; text-align: right; font-size: 14px; color: #1e293b; font-weight: 500;">Rs ${item.price}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- Shipping Info -->
            <div style="background: #f0fdf4; border-radius: 8px; padding: 15px; margin-top: 25px; border: 1px solid #bbf7d0;">
              <p style="margin: 0; font-size: 14px; color: #166534; text-align: center;">
                You'll receive a shipping confirmation email when your order is on its way!
              </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0 20px;">
              <a href="${process.env.SERVER_ADDRESS}/order/track/?order-id=${orderNumber}" target="_blank"
                 style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px; box-shadow: 0 2px 4px rgba(79,70,229,0.2);">
                Track Your Order
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 20px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              Need help? Contact our support team at <a href="mailto:support@nexaease.com" target="_blank" style="color: #4f46e5; text-decoration: none;">support@nexaease.com</a>
              <br><span style="color: #9ca3af;">© 2025 NexaEase. All rights reserved.</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Watermark -->
      <p style="font-size: 11px; text-align: center; color: #d1d5db; margin-top: 20px;">
        Order #${orderNumber} • Secured with NexaEase
      </p>
    </div>
  `;
}

// function orderPlacedTemplate(order) {
//   const { orderNumber, createdAt, username, address, phone, total, items } = order;

//   return `
//     <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif;">
//       <!-- Gradient Border Container -->
//       <div style="background: linear-gradient(90deg, #4f46e5, #7c3aed); padding: 2px; border-radius: 12px;">
//         <!-- Main Content Card -->
//         <div style="background: #ffffff; border-radius: 10px; overflow: hidden;">
//           <!-- Header with Logo -->
//           <div style="padding: 30px 20px; text-align: center; background: linear-gradient(135deg, #f9fafb, #ffffff);">
//             <img src="https://i.ibb.co/fdrJ4Gkz/nexa-ease-logo-transparent.png" alt="NexaEase" style="height: 50px; width: auto; margin-bottom: 15px;">
//             <h2 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">Order Confirmation</h2>
//             <p style="font-size: 16px; color: #4b5563; margin-top: 10px;">Thank you for your purchase, ${username}!</p>
//           </div>

//           <!-- Order Details -->
//           <div style="padding: 30px;">
//             <!-- Customer Info Card -->
//             <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
//               <div style="margin-bottom: 15px;">
//                 <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: 500; color: #64748b;">SHIPPING ADDRESS</p>
//                 <p style="margin: 0; font-size: 15px; color: #1e293b;">${address}</p>
//               </div>
//               <div style="display: flex; justify-content: space-between;">
//                 <div>
//                   <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: 500; color: #64748b;">CONTACT NUMBER</p>
//                   <p style="margin: 0; font-size: 15px; color: #1e293b;">${phone}</p>
//                 </div>
//                 <div>
//                   <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: 500; color: #64748b;">ORDER DATE</p>
//                   <p style="margin: 0; font-size: 15px; color: #1e293b;">${createdAt.split('at')[0].trim()}</p>
//                 </div>
//               </div>
//             </div>

//             <!-- Total Amount -->
//             <div style="background: #ffffff; border-radius: 6px; padding: 15px; text-align: center; margin-bottom: 30px; border: 1px solid #e5e7eb;">
//               <p style="margin: 0; font-size: 13px; font-weight: 500; color: #64748b;">TOTAL AMOUNT</p>
//               <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 700; color: #4f46e5;">Rs ${total}</p>
//             </div>

//             <!-- Order Items -->
//             <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #111827;">Order Summary</h3>
//             <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
//               <table style="width: 100%; border-collapse: collapse;">
//                 <thead>
//                   <tr style="background: #f8fafc;">
//                     <th style="padding: 12px 15px; text-align: left; font-size: 14px; font-weight: 500; color: #64748b;">Product</th>
//                     <th style="padding: 12px 15px; text-align: center; font-size: 14px; font-weight: 500; color: #64748b;">Qty</th>
//                     <th style="padding: 12px 15px; text-align: right; font-size: 14px; font-weight: 500; color: #64748b;">Price</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   ${items.map(item => `
//                     <tr style="border-top: 1px solid #e5e7eb;">
//                       <td style="padding: 15px; font-size: 14px; color: #1e293b;">
//                         <a href="${process.env.SERVER_ADDRESS}/product/?id=${item.product_id}" target="_blank" style="color: #1e293b; text-decoration: none;">${item.product_name}</a>
//                       </td>
//                       <td style="padding: 15px; text-align: center; font-size: 14px; color: #1e293b;">${item.quantity}</td>
//                       <td style="padding: 15px; text-align: right; font-size: 14px; color: #1e293b; font-weight: 500;">Rs ${item.price}</td>
//                     </tr>
//                   `).join('')}
//                 </tbody>
//               </table>
//             </div>

//             <!-- Shipping Info -->
//             <div style="background: #f0fdf4; border-radius: 8px; padding: 15px; margin-top: 25px; border: 1px solid #bbf7d0;">
//               <p style="margin: 0; font-size: 14px; color: #166534; text-align: center;">
//                 You'll receive a shipping confirmation email when your order is on its way!
//               </p>
//             </div>

//             <!-- CTA Button -->
//             <div style="text-align: center; margin: 30px 0 20px;">
//               <a href="${process.env.SERVER_ADDRESS}/order/track/?order-id=${orderNumber}" target="_blank"
//                  style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px; box-shadow: 0 2px 4px rgba(79,70,229,0.2);">
//                 Track Your Order
//               </a>
//             </div>
//           </div>

//           <!-- Footer -->
//           <div style="padding: 20px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
//             <p style="margin: 0; font-size: 12px; color: #6b7280;">
//               Need help? Contact our support team at <a href="mailto:support@nexaease.com" target="_blank" style="color: #4f46e5; text-decoration: none;">support@nexaease.com</a>
//               <br><span style="color: #9ca3af;">© 2025 NexaEase. All rights reserved.</span>
//             </p>
//           </div>
//         </div>
//       </div>

//       <!-- Watermark -->
//       <p style="font-size: 11px; text-align: center; color: #d1d5db; margin-top: 20px;">
//         Order #${orderNumber} • Secured with NexaEase
//       </p>
//     </div>
//   `;
// }

module.exports = { otpTemplate, contactFormTemplate, orderPlacedTemplate };
