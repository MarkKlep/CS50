unsigned long long factorial(unsigned int n)
{
    for (unsigned int i = n - 1; i > 0; i--)
    {
        n *= i;
    }
    return n;
}
