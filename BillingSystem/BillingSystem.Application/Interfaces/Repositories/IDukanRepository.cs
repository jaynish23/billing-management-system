using System.Collections.Generic;
using System.Threading.Tasks;
using BillingSystem.Domain.Entities;

namespace BillingSystem.Application.Interfaces.Repositories
{
    public interface IDukanRepository
    {
        Task<IEnumerable<UserDukan>> GetPagedAsync(int pageNumber, int pageSize, string language);
        Task<int> GetTotalCountAsync();
        Task<UserDukan> GetByIdAsync(int dukanNo);
        Task<UserDukan> AddAsync(UserDukan userDukan);
        Task UpdateAsync(UserDukan userDukan);
        Task SoftDeleteAsync(int dukanNo);
    }
}
