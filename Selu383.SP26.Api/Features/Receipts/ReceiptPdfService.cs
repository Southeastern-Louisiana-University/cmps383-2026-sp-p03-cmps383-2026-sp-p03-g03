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

                    column.Item().Text("CAFFEINATED LIONS")
                        .Bold()
                        .FontSize(18);

                    column.Item().Text($"Order: {order.OrderCode}");
                    column.Item().Text($"Timestamp: {DateTime.UtcNow:yyyy-MM-dd hh:mm tt}");
                    column.Item().Text("ASAP").Bold();

                    if (!string.IsNullOrWhiteSpace(order.PickupName))
                        column.Item().Text($"Pickup: {order.PickupName}");

                    if (!string.IsNullOrWhiteSpace(order.Note))
                        column.Item().Text($"Order Note: {order.Note}");

                    column.Item().LineHorizontal(1);

                    foreach (var item in order.OrderItems)
                    {
                        column.Item().Text($"{item.Quantity} x {item.MenuItem?.Name ?? "Item"}");

                        if (!string.IsNullOrWhiteSpace(item.ItemNote))
                            column.Item().PaddingLeft(10).Text($"- {item.ItemNote}");

                        column.Item().Text($"Line Total: ${item.LineTotal:F2}");
                    }

                    column.Item().LineHorizontal(1);

                    column.Item().AlignRight().Text($"TOTAL: ${order.Total:F2}")
                        .Bold()
                        .FontSize(12);
                });
            });
        }).GeneratePdf();
    }
}