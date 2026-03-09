WIDTH_1 = 50;
WIDTH_2 = 120;
WIDTH_3 = 400;

let TABLE_JSON = null;

let MAIN_TABLE = null;

const updateButton = function(cell){
    var button = document.createElement('button');
    button.innerText = 'Update';
    button.classList.add('update_button');
    button.addEventListener('click', (event) =>
    {
        event.stopPropagation();
        const checkValue = +document.getElementById('check_input').value;
        const row = cell.getRow();
        const serviceValue = +row.getCell('last_serviced').getValue();
        row.getCell('last_serviced').setValue(checkValue);
        if(HAS_CHECKED)
        {
            checkService();
        }
    });
    return button;
};

const TABLE_CONFIG = 
{   
    layout: 'fitData',
    maxHeight: 300,
    columns:
    [
        {
            title: '',
            field: 'selector',
            headerSort: false,
            resizable: false,
            formatter: 'rowSelection',
            cssClass: 'center_cell'
        },

        {
            title: 'Maintenance Type',
            field: 'maintenance_type',
            resizable: false,
            width: WIDTH_3,
            editor: 'input'
        },
        
        {
            title: 'Duration',
            field: 'duration',
            resizable: false,
            width: WIDTH_2,
            editor: 'number'
        },

        {
            title: 'Last Serviced',
            field: 'last_serviced',
            resizable: false
        },

        {
            title: 'Service Status',
            field: 'service_status',
            resizable: false
        },

        {
            title: '',
            field: 'update',
            resizable: false,
            headerSort: false,
            formatter: updateButton
        }
    ]
}

const MILES_LIMIT = 500;

let HAS_CHECKED = false;

window.addEventListener('load', initPage);

/**
 * Initializes various aspects of the page.
 * @returns None
 */
function initPage()
{
    MAIN_TABLE = new Tabulator('#table_cont', TABLE_CONFIG);
    MAIN_TABLE.on('tableBuilt', () =>
    {
        const tableStyle =
        window.getComputedStyle(document.getElementById('table_cont'));
        document.getElementById('top_cont').style.width = tableStyle.width;
        loadLocal();
        let heightSum = 0;
        for(let child of document.body.children)
        {
            if(child.id !== 'main_cont')
            {
                const childStyle = window.getComputedStyle(child);
                heightSum += parseInt(childStyle.height, 10);
            }
            else
            {
                const buttonCont = child.getElementsByClas('button_cont')[0];
                const buttonHeight = parseInt(buttonCont, 10);
                const bottomCont = child.getElementsByClas('bottom_cont')[0];
                const bottomHeight = parseInt(bottomCont, 10);
                heightSum +=
                buttonHeight + bottomHeight + TABLE_CONFIG.maxHeight;
            }
        }
        document.body.style.minWidth = tableStyle.width;
        document.body.style.minHeight = heightSum + 20 + 'px';
    });
    MAIN_TABLE.on('cellEdited', (cell) =>
    {
        if(cell.getField() !== 'service_status')
        {
            TABLE_JSON = MAIN_TABLE.getData();
            const popup = document.getElementById('saved');
            popup.classList.add('show');
            popup.addEventListener('animationend', removeClass);

            function removeClass(event)
            {
                event.target.classList.remove('show');
                event.target.removeEventListener('animationend', removeClass)
            }
        }
    });
    window.addEventListener('pagehide', saveLocal);
    checkInput = document.getElementById('check_input');
    checkInput.addEventListener('focusout', () =>
    {
        if(checkInput.value < 0)
        {
            checkInput.value = 0;
        }
    });
    checkButton = document.getElementById('check_button');
    checkButton.addEventListener('click', checkService);
    statusButton = document.getElementById('clear_status');
    statusButton.addEventListener('click', clearStatuses);
    addButton = document.getElementById('add_button');
    addButton.addEventListener('click', addRow);
    delButton = document.getElementById('del_button');
    delButton.addEventListener('click', () => delRows(false));
    clrButton = document.getElementById('clr_button');
    clrButton.addEventListener('click', clrRows);
    getDate();
    setInterval(getDate, 1000);
}

/**
 * Gets the date in the title bar.
 * @returns None
 */
function getDate()
{
    const dateElement = document.getElementById('title_date');
    const now = new Date();
    dateElement.innerHTML = now.toLocaleDateString()
}

/**
 * Checks the service duration for all table entries.
 * @returns None
 */
function checkService()
{
    if(MAIN_TABLE.getRows().length > 0)
    {
        MAIN_TABLE.deselectRow();
        MAIN_TABLE.getRows().forEach((row) =>
        {
            const rowElement = row.getElement();
            const checkValue = +document.getElementById('check_input').value;
            const durationValue = +row.getCell('duration').getValue();
            const serviceValue = +row.getCell('last_serviced').getValue();
            if((checkValue - serviceValue) < durationValue)
            {
                if(durationValue > MILES_LIMIT && (checkValue - serviceValue) > (durationValue - MILES_LIMIT))
                {
                    removeStatus(rowElement);
                    rowElement.classList.add('almost_due');
                    row.getCell('service_status').setValue('Almost due');
                }
                else
                {
                    removeStatus(rowElement);
                    rowElement.classList.add('good');
                    row.getCell('service_status').setValue('Good');
                }
            }
            else
            {
                removeStatus(rowElement);
                rowElement.classList.add('past_due');
                row.getCell('service_status').setValue('Past due');
            }
        });
        HAS_CHECKED = true;
    }
}

/**
 * Clears the service status for all table entries.
 * @returns None
 */
function clearStatuses()
{
    MAIN_TABLE.getRows().forEach((row) =>
    {
        removeStatus(row.getElement());
        row.getCell('service_status').setValue('');
    });
    HAS_CHECKED = false;
}

/**
 * Removes the status for a single row.
 * @param {RowComponent} row - Given row from the table
 * @returns None
 */
function removeStatus(row)
{
    const statusClasses = ['good', 'almost_due', 'past_due'];
    for(let statusClass of statusClasses)
    {
        if(row.classList.contains(statusClass))
        {
            row.classList.remove(statusClass);
        }
    }
}

/**
 * Adds a row to the table.
 * @returns None
 */
function addRow()
{
    MAIN_TABLE.addRow({});
    TABLE_JSON = MAIN_TABLE.getData();
}

/**
 * Deletes the selected rows.
 * @param {Boolean} bypass - Bypasses the confirmation prompt if true
 * @returns None
 */
function delRows(bypass)
{
    if(MAIN_TABLE.getSelectedRows().length > 0)
    {
        if(bypass || confirm('Are you sure you want to delete the selected row(s)?'))
        {
            MAIN_TABLE.getSelectedRows().forEach((row) =>
            {
                row.delete();
            })
            TABLE_JSON = MAIN_TABLE.getData();
        }
    }
}

/**
 * Deletes all rows.
 * @returns None
 */
function clrRows()
{
    if(MAIN_TABLE.getRows().length > 0)
    {
        if(confirm('Are you sure you want to delete all rows?'))
        {
            MAIN_TABLE.selectRow();
            delRows(true);
        }
    }
}

/**
 * Saves the table and check input data to local storage.
 * @returns None
 */
function saveLocal()
{
    localStorage.setItem('checkValue',
    document.getElementById('check_input').value);
    clearStatuses();
    localStorage.setItem('table', JSON.stringify(TABLE_JSON));
}

/**
 * Loads the table and check input data from local storage.
 * @returns None
 */
function loadLocal()
{
    const checkValue = localStorage.getItem('checkValue');
    if(checkValue !== null)
    {
        document.getElementById('check_input').value = checkValue;
    }
    TABLE_JSON = JSON.parse(localStorage.getItem('table'));
    if(TABLE_JSON !== null)
    {
        MAIN_TABLE.setData(TABLE_JSON);
    }
}