using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace matrimony_subscription.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long id { get; set; }

        public string? first_name { get; set; }
        public string? last_name { get; set; }
        public string? email { get; set; }
        public string? password { get; set; }
        public string? gender { get; set; }
        public DateTime? date_of_birth { get; set; }
        public string? phone { get; set; }
        public string? address { get; set; }
        public string? marital_status { get; set; }
        public string? religion { get; set; }
        public string? caste { get; set; }
        public string? mother_tongue { get; set; }
        public string? education { get; set; }
        public string? profession { get; set; }
        public string? annual_income { get; set; }
        public string? hobbies { get; set; }
        public string? bio { get; set; }
        public int? age { get; set; }
        public string? location { get; set; }

        // Change subscription_status to boolean (nullable)
        public int? subscription_status { get; set; }  // Changed from string? to bool?
    }
}
