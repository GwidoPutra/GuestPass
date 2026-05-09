// Author: Gwido
namespace GuestPass.Api.models;

public class Event
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}