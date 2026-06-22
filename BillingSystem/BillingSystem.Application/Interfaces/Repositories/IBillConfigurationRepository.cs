using System.Threading.Tasks;
using BillingSystem.Domain.Entities;

namespace BillingSystem.Application.Interfaces.Repositories
{
    public interface IBillConfigurationRepository
    {
        Task<BillConfiguration?> GetByUserNoAsync(int userNo);
        Task AddAsync(BillConfiguration entity);
        Task UpdateAsync(BillConfiguration entity);
    }
}
