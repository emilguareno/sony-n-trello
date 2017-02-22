Trello-N Segment
=======================

Trello-N allows you to manage tasks, boards, lists, cards, add comments, create checklists and more, through voice commands on the go, with Sony's Concept N device.

Installation
-------------
1. Get an application key from Trello: <https://trello.com/app-key>
2. Get a server token: <https://trello.com/1/authorize?expiration=never&scope=read,write,account&response_type=token&name=Server%20Token&key=> + appKey  
3. Create a config.js file based on the config.sample.js file and add the key and token

Commands
-------------

- **list all boards**: Lists all of the boards under the current account
- **set board to ```board name```**: Sets the current board in memory. All future card and list commands will now be executed inside of this board.
- **list cards ```list name```**: Lists all cards under a list
- **move card ```card name``` to list ```list name```**: Moves a card from it's current list to the specified list
- **add comment to ```card name```**: Adds a comment to the card specified. The device will prompt the user to speak the comment after the "add comment" command is executed.