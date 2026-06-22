using System.Collections.Generic;
using System.Threading.Tasks;
using BillingSystem.Domain.Entities;

namespace BillingSystem.Application.Interfaces.Repositories
{
    public interface IMillRepository
    {
        Task<IEnumerable<UserMill>> GetPagedAsync(int pageNumber, int pageSize, string language);
        Task<int> GetTotalCountAsync();
        Task<UserMill> GetByIdAsync(int millNo);
        Task<UserMill> AddAsync(UserMill mill);
        Task UpdateAsync(UserMill mill);
        Task SoftDeleteAsync(int millNo);
    }
}
