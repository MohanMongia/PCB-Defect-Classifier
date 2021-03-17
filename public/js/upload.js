const uploadImage = (button) =>{
    
    const parentNode = button.parentNode;
    // console.log(parentNode.children);
    const fileInput = document.querySelector(`[name=${parentNode.children[0].name}]`);
    // console.log(fileInput.name);
    if(!fileInput.files[0])
    {
        return console.log('No file added. Please select a file');
    }
    const formData = new FormData();
    formData.append('image',fileInput.files[0]);
    fetch(`/upload/${fileInput.name}`,{
        method: 'POST',
        body: formData,
    })
    .then(result => {
        // recieve the image path
        return result.json();
    })
    .then(data => {
        //serve the image
        console.log(data);
        if(data.message == 'test uploaded')
        {
            document.querySelector('.templater').classList.remove('hidden');
            document.querySelector('.allower').classList.add('hidden');
        }
        parentNode.children[0].classList.add('hidden');
        parentNode.children[1].classList.add('hidden');
        parentNode.children[2].classList.remove('hidden');
        // console.log(parentNode.children[2].src + '  1');
        console.log(data['image-src']);
        parentNode.children[2].src=`/${data['image-src']}`;
        // productElement.remove();
    })
    .catch(err => {
        console.log(err)
    });
}