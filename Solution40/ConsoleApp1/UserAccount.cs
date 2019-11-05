namespace ConsoleApp1
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("mr.UserAccounts")]
    public partial class UserAccount
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public UserAccount()
        {
            UserClaims = new HashSet<UserClaim>();
        }

        [Key]
        public int Key { get; set; }

        public DateTime? BypassInactivityCutoff { get; set; }

        public Guid ID { get; set; }

        [Required]
        [StringLength(50)]
        public string Tenant { get; set; }

        [Required]
        [StringLength(254)]
        public string Username { get; set; }

        public DateTime Created { get; set; }

        public DateTime LastUpdated { get; set; }

        public bool IsAccountClosed { get; set; }

        public DateTime? AccountClosed { get; set; }

        public bool IsLoginAllowed { get; set; }

        public DateTime? IsLoginAllowedChanged { get; set; }

        public DateTime? LastLogin { get; set; }

        public DateTime? LastFailedLogin { get; set; }

        public int FailedLoginCount { get; set; }

        public DateTime? PasswordChanged { get; set; }

        public bool RequiresPasswordReset { get; set; }

        [StringLength(500)]
        public string Email { get; set; }

        public bool IsAccountVerified { get; set; }

        public DateTime? LastFailedPasswordReset { get; set; }

        public int FailedPasswordResetCount { get; set; }

        [StringLength(100)]
        public string MobileCode { get; set; }

        public DateTime? MobileCodeSent { get; set; }

        [StringLength(20)]
        public string MobilePhoneNumber { get; set; }

        public DateTime? MobilePhoneNumberChanged { get; set; }

        public int AccountTwoFactorAuthMode { get; set; }

        public int CurrentTwoFactorAuthStatus { get; set; }

        [StringLength(100)]
        public string VerificationKey { get; set; }

        public int? VerificationPurpose { get; set; }

        public DateTime? VerificationKeySent { get; set; }

        [StringLength(500)]
        public string VerificationStorage { get; set; }

        [StringLength(200)]
        public string HashedPassword { get; set; }

        public bool CanExpire { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? AccountApproved { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? AccountRejected { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<UserClaim> UserClaims { get; set; }
    }
}
