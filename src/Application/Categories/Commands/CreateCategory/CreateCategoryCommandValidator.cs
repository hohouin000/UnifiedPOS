namespace UnifiedPOS.Application.Categories.Commands.CreateCategory;

public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    private readonly IApplicationDbContext _context;

    public CreateCategoryCommandValidator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(v => v.Prefix)
            .NotEmpty().WithMessage("Prefix is required.")
            .MaximumLength(3).WithMessage("Prefix must not exceed 3 characters.")
            .MustAsync(BeUniquePrefix).WithMessage("This prefix is already in use.");

        RuleFor(v => v.ColorCode)
            .MaximumLength(7).WithMessage("Color code must not exceed 7 characters.");
    }

    private async Task<bool> BeUniquePrefix(string prefix, CancellationToken cancellationToken)
    {
        return await _context.Categories
            .AllAsync(c => c.Prefix.ToUpper() != prefix.ToUpper(), cancellationToken);
    }
}
