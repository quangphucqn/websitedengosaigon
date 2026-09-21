import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { OrderDocument } from '../orders/order.schema';

function money(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function escapeHtml(value: string | number): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(value).replace(/[&<>"']/g, (character) => entities[character]);
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendOrderNotification(order: OrderDocument): Promise<void> {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const to =
      this.config.get<string>('ADMIN_EMAIL_TO') ??
      this.config.get<string>('ADMIN_EMAIL');
    const from = this.config.get<string>('SMTP_FROM') ?? user;

    if (!host || !user || !pass || !to || !from) {
      this.logger.warn(
        `Đơn ${order._id.toString()} đã lưu nhưng chưa gửi email: SMTP chưa được cấu hình.`,
      );
      return;
    }

    const rows = order.items
      .map(
        (item) =>
          `<tr><td style="padding:8px 0">${escapeHtml(item.name)}</td><td align="center">${item.quantity}</td><td align="right">${money(item.price * item.quantity)}</td></tr>`,
      )
      .join('');
    const createdAt = new Date(order.createdAt ?? Date.now()).toLocaleString(
      'vi-VN',
    );
    const html = `
      <div style="font-family:Arial,sans-serif;color:#2d211b;max-width:620px;margin:auto">
        <h1 style="font-size:24px">Có đơn hàng mới</h1>
        <p><strong>Mã đơn:</strong> ${order._id.toString()}</p>
        <p><strong>Thời gian:</strong> ${createdAt}</p>
        <hr style="border:0;border-top:1px solid #e7e3da" />
        <p><strong>Khách hàng:</strong> ${escapeHtml(order.customerName)}</p>
        <p><strong>Điện thoại:</strong> ${escapeHtml(order.phone)}</p>
        <p><strong>Địa chỉ:</strong> ${escapeHtml(order.address)}</p>
        <p><strong>Ghi chú:</strong> ${escapeHtml(order.note || 'Không có')}</p>
        <table width="100%" cellspacing="0" style="border-collapse:collapse;margin-top:20px">
          <thead><tr><th align="left">Sản phẩm</th><th>Số lượng</th><th align="right">Thành tiền</th></tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr><td colspan="2" style="padding-top:16px"><strong>Tổng cộng</strong></td><td align="right" style="padding-top:16px"><strong>${money(order.totalAmount)}</strong></td></tr></tfoot>
        </table>
      </div>`;

    try {
      const transporter = nodemailer.createTransport({
        host,
        port: Number(this.config.get<string>('SMTP_PORT') ?? 587),
        secure: this.config.get<string>('SMTP_SECURE') === 'true',
        auth: { user, pass },
      });
      await transporter.sendMail({
        from,
        to,
        subject: `Đơn hàng mới #${order._id.toString().slice(-6).toUpperCase()} – Đèn Gỗ Sài Gòn`,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Đơn ${order._id.toString()} đã lưu nhưng gửi email thất bại.`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
