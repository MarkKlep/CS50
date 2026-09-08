#include <stdio.h>

#include "factorial.h"

int main()
{
    int n;

    printf("Enter a number: ");
    scanf("%d", &n);

    printf("%d! = %llu\n", n, factorial(n));

    return 0;
}
