using matrimony_subscription.Data;
using matrimony_subscription.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Reflection;
using System.Threading.Tasks;

namespace matrimony_subscription.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> UpdateUserColumnAsync(long userId, string columnName, string newValue)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;

            var property = typeof(User).GetProperty(columnName, BindingFlags.Public | BindingFlags.Instance);
            if (property != null && property.CanWrite)
            {
                // Handle nullable int specifically for subscription_status
                if (columnName.Equals("subscription_status", StringComparison.OrdinalIgnoreCase))
                {
                    if (int.TryParse(newValue, out int subscriptionStatus))
                    {
                        property.SetValue(user, subscriptionStatus);
                    }
                    else
                    {
                        // Handle invalid conversion for subscription_status
                        return false;
                    }
                }
                else
                {
                    // Handle other properties as normal
                    try
                    {
                        object convertedValue = Convert.ChangeType(newValue, property.PropertyType);
                        property.SetValue(user, convertedValue);
                    }
                    catch
                    {
                        // Handle invalid conversion gracefully
                        return false;
                    }
                }

                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }

        // Optional: Add method to retrieve user by ID
        public async Task<User> GetUserByIdAsync(long userId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.id == userId);
        }
    }
}
