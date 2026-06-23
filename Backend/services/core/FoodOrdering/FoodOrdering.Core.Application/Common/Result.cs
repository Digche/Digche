namespace FoodOrdering.Core.Application.Common;

public class Result
{
    public bool IsSuccess { get; }
    public string? ErrorMessage { get; }
    public bool IsFailure => !IsSuccess;

    protected Result(bool isSuccess, string? errorMessage)
    {
        IsSuccess = isSuccess;
        ErrorMessage = errorMessage;
    }

    public static Result Success() => new(true, null);
    public static Result Failure(string message) => new(false, message);
}

public class Result<T> : Result
{
    public T? Data { get; }

    private Result(bool isSuccess, string? errorMessage, T? data) : base(isSuccess, errorMessage)
    {
        Data = data;
    }

    public static Result<T> Success(T data) => new(true, null, data);
    public static new Result<T> Failure(string message) => new(false, message, default);
}