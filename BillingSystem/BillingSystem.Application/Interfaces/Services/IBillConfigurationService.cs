using System.Threading.Tasks;
using BillingSystem.Application.DTOs;

namespace BillingSystem.Application.Interfaces.Services
{
    public interface IBillConfigurationService
    {
        Task<BillConfigurationDto?> GetByUserIdAsync(int userId);
        Task<BillConfigurationDto> SaveAsync(int userId, BillConfigurationDto dto);
    }
}
