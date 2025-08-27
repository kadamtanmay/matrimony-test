using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using matrimony_subscription.Services;

namespace matrimony_subscription.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUserColumn(long userId, [FromQuery] string columnName, [FromQuery] string newValue)
        {
            bool result = await _userService.UpdateUserColumnAsync(userId, columnName, newValue);
            if (result)
                return Ok(new { message = "User updated successfully." });

            return BadRequest(new { message = "Update failed. Check column name or userId." });
        }

        // You can optionally add a GET method to fetch user details with subscription status
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById(long userId)
        {
            var user = await _userService.GetUserByIdAsync(userId);
            if (user != null)
            {
                return Ok(user);
            }
            return NotFound(new { message = "User not found." });
        }
    }
}
