#include "compare.h"
#include <stdio.h>
#include <stdlib.h>
#include "factorial.h"

// correctness design style

void show_menu(void);

int main()
{
    int running = 1;
    while (running)
    {
        show_menu();

        char choice;
        printf("Enter your choice: ");
        scanf(" %c", &choice);

        switch (choice)
        {
        case '1':
        {
            int n;
            printf("Enter a non-negative integer: ");
            if (scanf("%d", &n) != 1)
            {
                printf("Error: Invalid input. Please enter a valid integer.\n");

                while (getchar() != '\n')
                {
                }
            }
            else if (n < 0)
            {
                printf("Error: Factorial is not defined for negative numbers.\n");
            }
            else
            {
                unsigned long long result = factorial(n);
                printf("Factorial of %d is %llu\n", n, result);
            }

            break;
        }
        case '2':
        {
            int a, b;
            printf("Enter two integers: ");
            scanf("%d %d", &a, &b);
            int cmp_result = compare(a, b);
            printf("Comparison result: %d\n", cmp_result);

            break;
        }
        case '3':
        {
            printf("Exiting the program.\n");
            running = 0;

            break;
        }
        default:
        {
            printf("Invalid choice. Please try again.\n");
        }
        }
    }

    return 0;
}

void show_menu(void)
{
    printf("1. Calculate Factorial\n");
    printf("2. Compare Two Numbers\n");
    printf("3. Exit\n");
}
