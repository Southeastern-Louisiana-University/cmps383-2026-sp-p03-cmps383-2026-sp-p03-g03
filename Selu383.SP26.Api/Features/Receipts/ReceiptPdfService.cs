using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Selu383.SP26.Api.Features.Orders;

namespace Selu383.SP26.Api.Features.Receipts;

public class ReceiptPdfService
{
    public byte[] GenerateReceipt(Order order)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(20);

                page.Content().Column(column =>
                {
                    column.Spacing(6);

                    column.Item().Text("CAFFEINATED LIONS").Bold().FontSize(18);
                    column.Item().Text($"Order: {order.OrderCode}");
                    column.Item().Text($"Timestamp: {order.OrderTime:yyyy-MM-dd hh:mm tt}");

                    if (order.ScheduledPickupTime.HasValue)
                        column.Item().Text($"Pickup: {order.ScheduledPickupTime.Value:yyyy-MM-dd hh:mm tt}").Bold();
                    else
                        column.Item().Text("Pickup: ASAP").Bold();

                    column.Item().Text($"Payment Status: {order.PaymentStatus}");

                    if (!string.IsNullOrWhiteSpace(order.PickupName))
                        column.Item().Text($"Pickup Name: {order.PickupName}");

                    if (!string.IsNullOrWhiteSpace(order.Note))
                        column.Item().Text($"Order Note: {order.Note}");

                    column.Item().LineHorizontal(1);

                    foreach (var item in order.OrderItems)
                    {
                        column.Item().Text($"{item.Quantity} x {item.MenuItemName}");

                        if (!string.IsNullOrWhiteSpace(item.ItemNote))
                            column.Item().PaddingLeft(10).Text($"- {item.ItemNote}");

                        column.Item().Text($"Line Total: ${item.LineTotal:F2}");
                    }

                    column.Item().LineHorizontal(1);
                    column.Item().AlignRight().Text($"SUBTOTAL: ${order.Subtotal:F2}");
                    column.Item().AlignRight().Text($"TAX: ${order.Tax:F2}");
                    column.Item().AlignRight().Text($"TOTAL: ${order.Total:F2}").Bold().FontSize(12);
                });
            });
        }).GeneratePdf();
    }

    public byte[] GenerateThermalReceipt(Order order)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(new PageSize(226, PageSizes.A4.Height));
                page.Margin(8);

                page.Content().Column(column =>
                {
                    column.Spacing(3);

                    column.Item().AlignCenter().Text("CAFFEINATED LIONS").Bold().FontSize(14);
                    column.Item().AlignCenter().LineHorizontal(1);

                    column.Item().Text($"Order: {order.OrderCode}").FontSize(10);
                    column.Item().Text($"Time: {order.OrderTime:MM/dd/yyyy HH:mm}").FontSize(9);

                    if (order.ScheduledPickupTime.HasValue)
                        column.Item().Text($"Pickup: {order.ScheduledPickupTime.Value:MM/dd/yyyy HH:mm}").Bold().FontSize(10);
                    else
                        column.Item().Text("Pickup: ASAP").Bold().FontSize(10);

                    column.Item().Text($"Payment: {order.PaymentStatus}").FontSize(9);

                    if (!string.IsNullOrWhiteSpace(order.PickupName))
                        column.Item().Text($"For: {order.PickupName}").FontSize(9);

                    if (!string.IsNullOrWhiteSpace(order.Note))
                        column.Item().Text($"Note: {order.Note}").FontSize(9);

                    column.Item().LineHorizontal(1);

                    foreach (var item in order.OrderItems)
                    {
                        column.Item().Text($"{item.Quantity}x {item.MenuItemName}").FontSize(10);

                        if (!string.IsNullOrWhiteSpace(item.ItemNote))
                            column.Item().PaddingLeft(5).Text($"• {item.ItemNote}").FontSize(8);

                        column.Item().Text($"${item.LineTotal:F2}").FontSize(9);
                    }

                    column.Item().LineHorizontal(1);
                    column.Item().AlignRight().Text($"SUBTOTAL: ${order.Subtotal:F2}").FontSize(9);
                    column.Item().AlignRight().Text($"TAX: ${order.Tax:F2}").FontSize(9);
                    column.Item().AlignRight().Text($"TOTAL: ${order.Total:F2}").Bold().FontSize(12);
                    column.Item().AlignCenter().LineHorizontal(1);
                    column.Item().AlignCenter().Text("Thank you for your order!").FontSize(9);
                    column.Item().AlignCenter().Text(order.OrderTime.ToString("yyyy-MM-dd HH:mm:ss")).FontSize(8);
                });
            });
        }).GeneratePdf();
    }
}