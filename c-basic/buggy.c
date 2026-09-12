#include <stdio.h>

int main(void)
{
    int height;
    printf("Enter height: ");
    scanf("%d", &height);

    for (int i = 0; i < height; i++)
    {
        printf("#\n");
    }

    return 0;
}