#include <stdio.h>

void print_row(int i, int mario_x, int mario_y, int col);

void play_mario_game(void)
{

    const int row = 5;
    const int col = 5;

    int mario_x = 0;
    int mario_y = 0;

    int running = 1;

    while (running)
    {
        for (int i = 0; i < row; i++)
        {
            print_row(i, mario_x, mario_y, col);
            printf("\n");
        }

        printf("Use arrow keys to move Mario (WASD) or Q to quit:\n");
        char arrow;
        scanf(" %c", &arrow);

        if (arrow == 'w' || arrow == 'W')
        {
            if (mario_x > 0)
            {
                mario_x--;
            }
        }
        else if (arrow == 's' || arrow == 'S')
        {
            if (mario_x < row - 1)
            {
                mario_x++;
            }
        }
        else if (arrow == 'a' || arrow == 'A')
        {
            if (mario_y > 0)
            {
                mario_y--;
            }
        }
        else if (arrow == 'd' || arrow == 'D')
        {
            if (mario_y < col - 1)
            {
                mario_y++;
            }
        }
        else if (arrow == 'q' || arrow == 'Q')
        {
            printf("Exiting the game.\n");
            running = 0;
            break;
        }
    }
}

void print_row(int i, int mario_x, int mario_y, int col)
{
    for (int j = 0; j < col; j++)
    {
        if (i == mario_x && j == mario_y)
        {
            printf("M ");
        }
        else
        {
            printf("* ");
        }
    }
}