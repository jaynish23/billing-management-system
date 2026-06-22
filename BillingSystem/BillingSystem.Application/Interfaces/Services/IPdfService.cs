using System.Threading.Tasks;

namespace BillingSystem.Application.Interfaces.Services
{
    public interface IPdfService
    {
        Task<byte[]> GenerateLedgerPdfAsync(int id, string type, string lang, int userId);
    }
}
