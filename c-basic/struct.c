#include <stdio.h>
#include <string.h>

typedef struct
{
    char name[50];
    int age;
    float height;
} Person;

int main(void)
{
    Person people[3];

    people[0].age = 25;
    people[0].height = 5.9;
    strcpy(people[0].name, "Alice");

    people[1].age = 30;
    people[1].height = 6.1;
    strcpy(people[1].name, "Bob");

    people[2].age = 22;
    people[2].height = 5.5;
    strcpy(people[2].name, "Charlie");

    char name[50];
    printf("Enter a name to search: ");
    scanf("%s", name);

    int found = 0;
    for (int i = 0; i < 3; i++)
    {
        if (strcmp(people[i].name, name) == 0)
        {
            printf("Found %s: Age = %d, Height = %.1f\n", people[i].name, people[i].age, people[i].height);
            found = 1;
            break;
        }
    }

    return 0;
}