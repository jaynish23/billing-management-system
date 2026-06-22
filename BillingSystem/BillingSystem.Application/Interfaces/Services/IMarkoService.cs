using System.Collections.Generic;
using System.Threading.Tasks;
using BillingSystem.Application.DTOs;

namespace BillingSystem.Application.Interfaces.Services
{
    public interface IMarkoService
    {
        Task<(IEnumerable<MarkoDto> markos, int totalCount)> GetPagedMarkosAsync(int pageNumber, int pageSize, string language);
        Task<MarkoDto> GetMarkoByIdAsync(int markoNo, string language);
        Task<MarkoDto> CreateMarkoAsync(MarkoDto markoDto);
        Task UpdateMarkoAsync(int markoNo, MarkoDto markoDto);
        Task DeleteMarkoAsync(int markoNo);
    }
}
