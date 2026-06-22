using System.Collections.Generic;
using System.Threading.Tasks;
using BillingSystem.Application.DTOs;

namespace BillingSystem.Application.Interfaces.Services
{
    public interface IMillService
    {
        Task<(IEnumerable<MillDto> mills, int totalCount)> GetPagedMillsAsync(int pageNumber, int pageSize, string language);
        Task<MillDto> GetMillByIdAsync(int millNo, string language);
        Task<MillDto> CreateMillAsync(MillDto millDto);
        Task UpdateMillAsync(int millNo, MillDto millDto);
        Task DeleteMillAsync(int millNo);
    }
}
