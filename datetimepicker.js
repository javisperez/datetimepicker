(function ($) {

    $.fn.datetimepicker = Datetimepicker;

    function Datetimepicker(options) {

        var defaults = {
            minDate   : 24,
            maxDate   : 24,
            startDate    : null,
            onChange     : null,
            element      : this,
            daysLabel    : ['S','M','T','W','T','F','S'],
            monthsLabel  : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dec'],
            timerFormat  : 12 // or 24
        }

        options = $.extend({}, defaults, options);

        /**
         * Variables
         */
        var d          = document;
        var ce         = function($element) {
                            return d.createElement.call(d, $element);
                         }
        var date       = !options.startDate ? new Date() : new Date(options.startDate);    
        var isMouseDown= false;
        var navTimer   = null;
        var dateContainer = ce('div');
        var timeContainer = ce('div');
        var datepickerContainer = ce('div');
        var today      = new Date();
        var currentHour = 8;
        var currentMinute = 0;
        var altField = null;
		
		if (options.minDate == 'today') {
			options.minDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
		} else {
			if(!/^(\d{4})-(\d{1,2})-(\d{1,2})$/.test(options.minDate)) {
				var tmpDate = new Date(today);
	
				if (typeof options.minDate == 'number') {
					tmpDate.setMonth( today.getMonth() - options.minDate );
				} else {
					tmpDate.setMonth( today.getMonth() - defaults.minDate );
				}
				
				options.minDate = tmpDate.getFullYear()+'-'+(tmpDate.getMonth()+1)+'-'+tmpDate.getDate();
			}
		}

		if (options.maxDate == 'today') {
			options.maxDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
		} else {
			if(!/^(\d{4})-(\d{1,2})-(\d{1,2})$/.test(options.maxDate)) {
				var tmpDate = new Date(today);
	
				if (typeof options.maxDate == 'number') {
					tmpDate.setMonth( today.getMonth() + options.maxDate );
				} else {
					tmpDate.setMonth( today.getMonth() + defaults.maxDate );
				}
				options.maxDate = tmpDate.getFullYear()+'-'+(tmpDate.getMonth()+1)+'-'+tmpDate.getDate();
			}
		}

		var minLimits = options.minDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
		var maxLimits = options.maxDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

        dateContainer.className = 'date-container';
        timeContainer.className = 'time-container';
        datepickerContainer.className = 'datepicker-container';

        // extending the date
        date.daysInMonth = function() {
                                        var tmp = new Date(date);
                                        tmp.setDate(32);
                                        return 32 - tmp.getDate();
        }

        date.firstDayInMonth = function() {
                                        var tmp = new Date(date);
                                        tmp.setDate(1);
                                        return tmp.getDay();
        }


        // Clear the mouse up event
        document.onmouseup = function() {
                 stopSeek();
        }

        // Private methods
        // Fast seek when mouse button is hold down
        function fastSeek(index) {
            isMouseDown = true;

            navTimer = setTimeout(function() {
                gotoMonth(index, true);
            }, 500);
        }

        // Stop seeking if the mouse is up    
        function stopSeek() {
            isMouseDown = false;

            clearTimeout(navTimer);
        }

        // Go to a relative month (-1 = previous, 1 = next)
        function gotoMonth(index, recursive) {
			if (index == -1 && (+date.getMonth()+1 == minLimits[2] && date.getFullYear() == minLimits[1])) {
				return;
			} else
			if (index == 1 && (+date.getMonth()+1 == maxLimits[2] && date.getFullYear() == maxLimits[1])) {
				return;
			}
			

            date.setDate(1);
            date.setMonth(date.getMonth()+index);
            date.setFullYear(date.getFullYear());

            build();

            options.onChange && options.onChange.call(Datepicker, date);

            if(recursive && isMouseDown) {
                setTimeout(function() {
                    gotoMonth(index, recursive);
                }, 50);
            }
        }

        // Build the html    
        function build() {
            var columns     = 7; // 7 days, so 7 cells
            var rows        = Math.ceil((date.daysInMonth() + date.firstDayInMonth()) / columns ); // How many rows of cells depending on the month days
            var currentDate = 1; // Days counter

            // Create all empty elements to reference later        
            var table  = ce('table');
            var tr     = ce('tr');
            var tdPrev = ce('td');
            var tdYear = ce('td');
            var tdNext = ce('td');

            // Properties
            table.cellSpacing = 0;
            table.cellPadding = 0;

            tdYear.colSpan = 5;
            tdYear.align = 'center';
            tdYear.className = 'year';
            tdYear.innerHTML = options.monthsLabel[date.getMonth()] +' '+ date.getFullYear();

            tdPrev.innerHTML = '&#9664;';
            tdNext.innerHTML = '&#9654;';

            // Events on those elements
            tdPrev.onclick = function(){
                gotoMonth(-1);
            }
            tdPrev.onmousedown = function() {
                fastSeek(-1);
            }

            tdNext.onclick = function() {
                gotoMonth(1);
            }
            tdNext.onmousedown = function() {
                fastSeek(1);
            }

            // Attach all td's to the first row
            tr.appendChild(tdPrev);
            tr.appendChild(tdYear);
            tr.appendChild(tdNext);

            // And the row to the table
            table.appendChild(tr);

            for(var i=0; i<=rows; i++) { // Note the condition <= instead of <, this is to use the "days" label in the first row
                // Create the row that will hold the next 7 days
                var tr = ce('tr');

                for(var j=0; j<columns; j++) {
                    // Create each day cell
                    var td = ce('td');

                    td.align = 'center';

                    if(i==0) { // if we're in the first row, attach the days label
                        td.innerHTML = options.daysLabel[j];
                        tr.appendChild(td);
                        continue;
                    }

                    // If the current day cell is less than the first day of the current month, leave the empty cell (at beginning of the month)
                    if((j < date.firstDayInMonth() && i == 1)  || currentDate > date.daysInMonth()) {
                        td.className = 'emptyDay';
                    } else {
                        isToday = today.getDate() == currentDate;
                        isToday = isToday && today.getMonth()    == date.getMonth();
                        isToday = isToday && today.getFullYear() == date.getFullYear();
						
						var isInMinLimit = date.getFullYear() == minLimits[1] && date.getMonth()+1  == minLimits[2];
						var isInMaxLimit = date.getFullYear() == maxLimits[1] && date.getMonth()+1  == maxLimits[2];

                        if(isToday) {
                            td.className = 'today';
                        }

                        td.className += ' date';

                        $(td).attr('data-date-year-value', date.getFullYear());

                        $(td).attr('data-date-month-value', date.getMonth());

                        $(td).attr('data-date-day-value', currentDate);

						if ((isInMinLimit && currentDate < minLimits[3]) || (isInMaxLimit && currentDate > maxLimits[3])) {
								td.className += ' disabled';
						}

                        td.innerHTML = currentDate++;

                        // When clicking on each date td, deselect any previous one, and select the clicked one
                        td.onclick = function() {
							if ($(this).hasClass('disabled')) {
								return;
							}
                            selectDate(this);
                        }
                    }

                    // Add each day to its row                
                    tr.appendChild(td);
                }

                // And each row to the table
                table.appendChild(tr);
            }

            empty(dateContainer);
            empty(timeContainer);

            dateContainer.appendChild(table);      
            timeContainer.appendChild(buildTime());

            datepickerContainer.appendChild(dateContainer);
            datepickerContainer.appendChild(timeContainer);

            return datepickerContainer;        
        }

        // Select a date
        function selectDate(clickedCell) {
            $(dateContainer).find('td.selected').removeClass('selected');

            $(clickedCell).addClass('selected');
        }

        // Empty an element
        function empty(element) {
            while (element.lastChild) {
              element.removeChild(element.lastChild);
            }
        }

        // Add heading zeros if less than 10
        function pad(n) {
            return n < 10 ? '0' + n : n;
        }

        // Build the html for the time selector
        function buildTime() {
            var table = ce('table');
            var tr    = ce('tr');
            var tdPlus = ce('td');
            var tdMinus = ce('td');
            var tdPlusMinutes = ce('td');
            var tdMinusMinutes = ce('td');
            var td = ce('td');
            var hours = ce('input');
            var minutes = hours.cloneNode(true);

            table.cellSpacing = 0;
            table.cellPadding = 0;

            tdPlus.innerHTML  = '+';        
            tdMinus.innerHTML = '-';
            tdPlusMinutes.innerHTML  = '+';
            tdMinusMinutes.innerHTML = '-';

            tdPlus.className = 'stepper';
            tdMinus.className = 'stepper';
            tdPlusMinutes.className = 'stepper';
            tdMinusMinutes.className = 'stepper';

            hours.type = 'text';
            hours.name = 'hours';
            hours.value = pad(currentHour);

            minutes.type = 'text';
            minutes.name = 'minutes';
            minutes.value = pad(currentMinute);

            tdPlus.onclick = function() {
                var currentHour = hours.value;

                if(currentHour == 11 && options.timerFormat != 24) {
                    var $amPm = $(timeContainer).find('.amPm');
                    var currentAmPm = $amPm.text();

                    if(currentAmPm == 'am') {
                        currentAmPm = 'pm';
                    } else {
                        currentAmPm = 'am';
                    }

                    $amPm.text(currentAmPm);
                }

                if(options.timerFormat != 24) {
                    currentHour = currentHour == 12 ? 1 : +hours.value+1;
                } else {
                    currentHour = currentHour == 23 ? 0 : +hours.value+1;
                }

                hours.value = pad(currentHour);
            }

            tdMinus.onclick = function() {

                var currentHour = hours.value;

                if(currentHour == 12 && options.timerFormat != 24) {
                    var $amPm = $(timeContainer).find('.amPm');
                    var currentAmPm = $amPm.text();

                    if(currentAmPm == 'am') {
                        currentAmPm = 'pm';
                    } else {
                        currentAmPm = 'am';
                    }

                    $amPm.text(currentAmPm);
                }

                if(options.timerFormat != 24) {
                    currentHour = currentHour == 1 ? 12 : +hours.value-1;
                } else {
                    currentHour = currentHour == 0 ? 23 : +hours.value-1;
                }

                hours.value = pad(currentHour);
            }


            tdPlusMinutes.onclick = function() {
                currentMinute = minutes.value == 59 ? 0 : +minutes.value+1;

                minutes.value = pad(currentMinute);
            }

            tdMinusMinutes.onclick = function() {
                currentMinute = minutes.value == 0 ? 59 : +minutes.value-1;

                minutes.value = pad(currentMinute);
            }

            tr.appendChild(tdPlus);
            tr.appendChild(td.cloneNode(false));
            tr.appendChild(tdPlusMinutes);

            table.appendChild(tr);

            tr = tr.cloneNode();

            td.appendChild(hours);

            tr.appendChild(td); // hours input
            tr.appendChild(td.cloneNode(false));

            var td2 = td.cloneNode(false);
            td2.className = 'minutes-container ' + (options.timerFormat == 24 ? 'military-format' : '');
            td2.appendChild(minutes);

            var span = ce('span');

            if(options.timerFormat != 24) {
                span.innerHTML = 'pm';
                span.className = 'amPm';
            }

            td2.appendChild(span);
            tr.appendChild(td2); // minutes input

            table.appendChild(tr);

            tr = tr.cloneNode(false);

            td = ce('td');

            tr.appendChild(tdMinus); // hours minus
            tr.appendChild(td.cloneNode(false));
            tr.appendChild(tdMinusMinutes); // minutes minus

            table.appendChild(tr);

            tr = tr.cloneNode(false);

            var tdColspan = td.cloneNode(false);

            tdColspan.colSpan = 4;

            var setButton = ce('button');

            setButton.innerHTML = 'DONE';

            setButton.onclick = function() {

                                    var selectedTd = $(dateContainer).find('td.selected');

                                    if(selectedTd.length == 0) {
                                        hide();
                                        return;
                                    }

                                    var selectedDate    = selectedTd.get(0);
                                    var $timeContainer  = $(timeContainer);
                                    var selectedTime    = $timeContainer.find('input');

                                    var amOrPm       = $timeContainer.find('.amPm').text();
                                    var minutesValue = selectedTime.filter('[name=minutes]').val();
                                    var hoursValue   = selectedTime.filter('[name=hours]').val();

                                    var d = selectedDate.dataset;

                                    var valueString  = d.dateDayValue +' ';
                                        valueString += options.monthsLabel[d.dateMonthValue] +', ';
                                        valueString += d.dateYearValue +' @ ';
                                        valueString += hoursValue +':'+ minutesValue+' ';
                                        
                                    if(options.timerFormat != 24) {
                                        valueString += amOrPm.toUpperCase();
                                    }

                                    options.element.val( valueString );

                                    if(options.timerFormat != 24) {
                                        altField.val(d.dateYearValue+'-'+(+d.dateMonthValue+1)+'-'+d.dateDayValue +' '+ (+hoursValue + (amOrPm == 'pm' ? 12 : 0)) +':'+ minutesValue+':00' );
                                    } else {
                                        altField.val(d.dateYearValue+'-'+(+d.dateMonthValue+1)+'-'+d.dateDayValue +' '+ hoursValue +':'+ minutesValue+':00' );
                                    }

                                    hide();
            }

            tdColspan.appendChild(setButton);

            tr.appendChild(tdColspan);

            table.appendChild(tr);

            return table;
        }

        // Show the datepicker
        function show() {
            $(datepickerContainer).fadeIn('fast');
        }

        // Hide the datepicker
        function hide() {
            $(datepickerContainer).fadeOut('fast');
        }

        document.body.appendChild( build() );

        // Attach the element actions    
        var element = options.element;

        // On focus display the calendar
        element.focus(function(){
            show();
        });

        document.onmousedown = function(e) {
                            var target = e.target || e.srcElement;

                            if(!(target === element.get(0)) && !$(datepickerContainer).find(target).length) {
                                hide();
                            }
        }

        // Get the element position, to place the calendar below
        var offset = element.offset();

        $(datepickerContainer).css({
            top: offset.top + element.outerHeight(),
            left:offset.left
        });

        // Create the alt field to send the date format to
        altField = $('<input type="hidden" name="'+element.attr('name')+'" id="datepickerAltField" />').insertAfter(element);

        element.attr('name', element.attr('name')+'-original');

        // assign hide / show events

        this.on('dt:hide', hide);
        this.on('dt:show', show);

        return this;
    }
    
})(jQuery);
