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

initPage();
generateGears(1);

function initPage()
{
    MAIN_TABLE = new Tabulator('#table_cont', TABLE_CONFIG);
    // MAIN_TABLE.on('cellClick', (e, cell) =>
    // {
    //     const row = cell.getRow();
    //     if(cell.getField() === 'selector' && !HAS_CHECKED)
    //     {
    //         row.toggleSelect();
    //     }
    // });
    MAIN_TABLE.on('cellEdited', (cell) =>
    {
       TABLE_JSON = MAIN_TABLE.getData(); 
    });
    window.addEventListener('load', loadLocal);
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
}

function generateGears(count)
{
    const rowCount = 6;
    const colCount = 8;
    let coordinates = []
    for(let a = 0; a < rowCount; a++)
    {
        let row = []
        for(let b = 0; b < 8; b++)
        {
            row.push([b * window.innerWidth / colCount, a * window.innerHeight / rowCount]);
        }
        coordinates.push(row);
    }
    console.log(coordinates);
    // let prevIndexs = []
    // for(let a = 0; a < count; a++)
    // {
    //     const gear = document.createElement('img');
    //     gear.classList.add('gear');
    //     gear.src = 'gear.png';
    //     const size = window.innerWidth * (Math.random() * (.1 - .05) + .05);
    //     gear.style.width = Math.ceil(size) + 'px';
    //     gear.style.height = Math.ceil(size) + 'px';
    //     while(1 == 1)
    //     {
    //         const xIdx = Math.ceil(Math.random() * colCount);
    //         const yIdx = Math.ceil(Math.random() * rowCount);
    //         if(!prevIndexs.includes([xIdx, yIdx]))
    //         {
    //             const topCoordinate = coordinates[xIdx][yIdx][0] - size / 2;
    //             const leftCoordinate = coordinates[xIdx][yIdx][1] - size / 2;
    //             gear.style.left = Math.ceil(topCoordinate) + 'px';
    //             gear.style.top = Math.ceil(leftCoordinate) + 'px';
    //             const rotation = Math.random() * 45;
    //             gear.style.transform = 'rotate(' + Math.ceil(rotation) + 'deg)';
    //             prevIndexs.push([xIdx, yIdx]);
    //             break;
    //         }
    //     }
    //     document.body.appendChild(gear);
    // }
}

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

function clearStatuses()
{
    MAIN_TABLE.getRows().forEach((row) =>
    {
        removeStatus(row.getElement());
        row.getCell('service_status').setValue('');
    });
    HAS_CHECKED = false;
}

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

function addRow()
{
    MAIN_TABLE.addRow({});
    TABLE_JSON = MAIN_TABLE.getData();
}

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

function saveLocal()
{
    localStorage.setItem('checkValue', document.getElementById('check_input').value); 
    for(let row of TABLE_JSON)
    {
        row.service_status = '';
    }
    localStorage.setItem('table', JSON.stringify(TABLE_JSON));
}

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