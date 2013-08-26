Datetimepicker
==============

A very basic datetime-picker jQuery plugin

I made this plugin because i needed a very basic datetime-picker, not just date.

I've tested with jQuery UI one, but for my purpose, it was too complicated, too big, too many files.

So i decided to make a very basic one, a really minimalistic, with simple design and good functionality.

I havent found all bugs yet, but if you see any please let me know, i'll be happy to fix it.


The current options supported are:

- backMonths : the max number of months than a user can go back
- fwdMonths : the max number of months than a user can seek foward
- startDate : the default date of the datetimepicker
- onChange  : a callback to execute whenever the user changes the date (goes to another month)
- daysLabel : an array of days label to display (like Sunday, Monday, etc)
- monthsLabel : an array with the label of the months
- timerFormat : the format of the time picker, if 12 hours or 24 (military)


Example of use
==============
```
  $('#datetime').datetimepicker({
    onChange : fn,
    daysLabel : ['D','L','M','M','J','V','S'],
    monthsLabel : ['E','F','M','A','M','J','J','A','S','O','N','D']
  });
```

If you need any new functionality or something that this plugin currently doesnt support, feel free to fork it and let me know i'd love to check it out!

This is currently on development, so new features might be added in the future, but so far i think is very useful.

For any information, please feel free to mail me : me@javisperez.com



