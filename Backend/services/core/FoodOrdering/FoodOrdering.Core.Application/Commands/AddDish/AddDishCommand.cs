using MediatR;
using FoodOrdering.Core.Application.Common;
using FoodOrdering.Core.Application.DTOs;

namespace FoodOrdering.Core.Application.Commands.AddDish;

public record AddDishCommand(CreateDishDto Dto) : IRequest<Result<Guid>>;