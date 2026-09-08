unsigned long long factorial(unsigned int n)
{
    if (n == 0 || n == 1)
    {
        return 1;
    }

    for (unsigned int i = n - 1; i > 0; i--)
    {
        n *= i;
    }
    return n;
}
