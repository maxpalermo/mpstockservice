window.onload = function()
{
    $(document).on('click', '.btn-pointer', function(){
        var id = $(this).closest('tr').find('td.id').text().trim();
        console.log ("clicked: ", id);
    });
}