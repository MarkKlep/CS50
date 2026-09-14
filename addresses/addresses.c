#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

int main(void)
{

    // printf("Value of address = %c\n", *(char *)0x102f15e10); // not in ASLR

    char s[] = "hello there!";

    char *t = malloc(strlen(s) * sizeof(char) + 1);
    printf("Address of t = %p\n", t);

    if (t == NULL)
    {
        printf(";(");
        return 1;
    }

    printf("String = %s\n", t);
    strcpy(t, s);

    t[0] = toupper(t[0]);
    printf("String = %s\n", t);

    free(t);

    return 0;
}