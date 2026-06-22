namespace BillingSystem.Application.Interfaces
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(int userId, string username, string firstName, string lastName, string role);
    }
}
