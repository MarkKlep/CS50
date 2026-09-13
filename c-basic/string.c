#include <stdio.h>
#include <string.h>

const int N = 5;

int string_length(char str[]);

void string_uppercase(char str[]);

float average(int length, int arr[]);

int main(int argc, char *argv[])
{
    if (argc < 2)
    {
        printf("Usage: %s <arguments>\n", argv[0]);
        return 1;
    }

    for (int i = 0; i < argc; i++)
    {
        printf("Argument %d: %s\n", i, argv[i]);
    }

    char name[] = "Mark";
    for (int i = 0, n = strlen(name); i < n; i++)
    {
        printf("Char: %c\n", name[i]);
    }

    printf("Your name: %s\n", name);
    string_uppercase(name);
    printf("Uppercase str: %s\n", name);

    int scores[N];

    for (int i = 0; i < N; i++)
    {
        printf("Score: ");
        scanf("%d", &scores[i]);
    }

    printf("Average score = %.2f\n", average(N, scores));

    return 0;
}

int string_length(char str[])
{
    int length = 0;

    while (str[length] != '\0')
    {
        length++;
    }

    return length;
}

void string_uppercase(char str[])
{
    int idx = 0;

    while (str[idx] != '\0')
    {
        if (str[idx] >= 97 && str[idx] <= 129)
        {
            str[idx] = str[idx] - 32;
        }

        idx++;
    }
}

float average(int length, int arr[])
{
    int sum = 0;

    for (int i = 0; i < length; i++)
    {
        sum += arr[i];
    }

    return sum / (float)length;
}