using System.Collections.Generic;
using System.Threading.Tasks;
using BillingSystem.Application.DTOs;

namespace BillingSystem.Application.Interfaces.Services
{
    public interface IDukanService
    {
        Task<(IEnumerable<DukanDto> dukans, int totalCount)> GetPagedDukansAsync(int pageNumber, int pageSize, string language);
        Task<DukanDto> GetDukanByIdAsync(int dukanNo, string language);
        Task<DukanDto> CreateDukanAsync(DukanDto dukanDto);
        Task UpdateDukanAsync(int dukanNo, DukanDto dukanDto);
        Task DeleteDukanAsync(int dukanNo);
    }
}
