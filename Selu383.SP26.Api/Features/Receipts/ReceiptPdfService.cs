using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Selu383.SP26.Api.Features.Orders;

namespace Selu383.SP26.Api.Features.Receipts;

public class ReceiptPdfService
{
    /// <summary>
    /// Generates a standard A4 formatted receipt PDF
    /// </summary>
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

    /// <summary>
    /// Generates an 80mm thermal printer formatted receipt PDF (suitable for thermal receipt printers)
    /// </summary>
    public byte[] GenerateThermalReceipt(Order order)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        // 80mm width = 226 points (approximately)
        // Thermal printers typically use narrow widths with auto-wrapping
        return Document.Create(container =>
        {
            // 80mm x auto-height page size
            container.Page(page =>
            {
                page.Size(new PageSize(226, PageSizes.A4.Height)); // 80mm width, A4 height
                page.Margin(8); // Smaller margins for thermal printer

                page.Content().Column(column =>
                {
                    column.Spacing(3);

                    // Header
                    column.Item().AlignCenter().Text("CAFFEINATED LIONS")
                        .Bold()
                        .FontSize(14);

                    column.Item().AlignCenter().LineHorizontal(1);

                    // Order info
                    column.Item().Text($"Order: {order.OrderCode}")
                        .FontSize(10);

                    column.Item().Text($"Time: {DateTime.UtcNow:MM/dd/yyyy HH:mm}")
                        .FontSize(9);

                    column.Item().Text("ASAP").Bold().FontSize(10);

                    if (!string.IsNullOrWhiteSpace(order.PickupName))
                        column.Item().Text($"For: {order.PickupName}").FontSize(9);

                    if (!string.IsNullOrWhiteSpace(order.Note))
                        column.Item().Text($"Note: {order.Note}").FontSize(9);

                    column.Item().LineHorizontal(1);

                    // Items
                    foreach (var item in order.OrderItems)
                    {
                        var itemName = $"{item.Quantity}x {item.MenuItem?.Name ?? "Item"}";
                        column.Item().Text(itemName).FontSize(10);

                        if (!string.IsNullOrWhiteSpace(item.ItemNote))
                            column.Item().PaddingLeft(5).Text($"• {item.ItemNote}").FontSize(8);

                        column.Item().Row(row =>
                        {
                            row.RelativeItem().Text($"${item.LineTotal:F2}").FontSize(9);
                        });
                    }

                    column.Item().LineHorizontal(1);

                    // Totals
                    column.Item().AlignRight().Text($"TOTAL: ${order.Total:F2}")
                        .Bold()
                        .FontSize(12);

                    column.Item().AlignCenter().LineHorizontal(1);

                    // Footer
                    column.Item().AlignCenter().Text("Thank you for your order!")
                        .FontSize(9);

                    column.Item().AlignCenter().Text(DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"))
                        .FontSize(8);
                });
            });
        }).GeneratePdf();
    }

    /// <summary>
    /// Generates a plain text version of the receipt suitable for thermal printer text mode
    /// </summary>
    public string GeneratePlainTextReceipt(Order order)
    {
        var sb = new System.Text.StringBuilder();
        const int lineWidth = 40; // Standard 80mm printer width in characters

        // Pad center text
        string Center(string text) => text.PadLeft((lineWidth + text.Length) / 2);
        string Line(char c = '-') => new string(c, lineWidth);

        sb.AppendLine(Center("CAFFEINATED LIONS"));
        sb.AppendLine(Line());
        sb.AppendLine($"Order: {order.OrderCode}");
        sb.AppendLine($"Time: {DateTime.UtcNow:MM/dd/yyyy HH:mm}");
        sb.AppendLine("Status: ASAP");

        if (!string.IsNullOrWhiteSpace(order.PickupName))
            sb.AppendLine($"For: {order.PickupName}");

        if (!string.IsNullOrWhiteSpace(order.Note))
            sb.AppendLine($"Note: {order.Note}");

        sb.AppendLine(Line());

        // Items
        foreach (var item in order.OrderItems)
        {
            var itemName = $"{item.Quantity}x {item.MenuItem?.Name ?? "Item"}";
            sb.AppendLine(itemName);

            if (!string.IsNullOrWhiteSpace(item.ItemNote))
                sb.AppendLine($"  • {item.ItemNote}");

            sb.AppendLine($"  ${item.LineTotal:F2}");
        }

        sb.AppendLine(Line());
        sb.AppendLine($"TOTAL: ${order.Total:F2}".PadLeft(lineWidth));
        sb.AppendLine(Line());
        sb.AppendLine(Center("Thank you for your order!"));
        sb.AppendLine(Center(DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")));
        sb.AppendLine();

        return sb.ToString();
    }
}