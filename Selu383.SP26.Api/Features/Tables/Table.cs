namespace Selu383.SP26.Api.Features.Tables;

public class Table
{
    public int Id { get; set; }

    public int LocationId { get; set; }

    public string TableNumber { get; set; } = string.Empty;

    public int Seats { get; set; }

    public bool IsBarSeat { get; set; } = false;

    public bool IsActive { get; set; } = true;
}