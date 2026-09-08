#include "compare.h"
#include <stdio.h>
#include "factorial.h"

int main()
{
    int n;

    printf("This program calculates the factorial of a number.\n");
    printf("Enter a number: ");
    scanf("%d", &n);

    printf("%d! = %llu\n", n, factorial(n));

    printf("Now let's compare two numbers.\n");
    int a, b;
    printf("Enter the first number: ");
    scanf("%d", &a);
    printf("Enter the second number: ");
    scanf("%d", &b);

    int result = compare(a, b);
    printf("Comparison result: %d\n", result);

    return 0;
}
