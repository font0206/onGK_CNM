const express = require('express');

const multer = require('multer');
const upload = multer();

const app = express();
const PORT = 4001;
const AWS = require('aws-sdk');
const { Neptune } = require('aws-sdk');
const config = new AWS.Config({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'ap-southeast-1'
})

AWS.config = config;
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'db_gk';


app.use(express.static("./views"));
app.set('view engine', 'ejs');
app.set('views', './views');



app.get('/', (req, res) => {
    const params = {
        TableName: tableName,
    }
    docClient.scan(params, (err, data) => {
        if (err) {
            res.send('ERRRRRRO');
        } else {
            return res.render('index', { baos: data.Items });
        }
    })

});
app.get('/show-form-add', (req, res) => {
    res.render('formAdd')
})
app.post('/', upload.fields([]), (req, res) => {
    const id = Date.now();
    const { ten_bao, ten_tacgia, isbn, so_trang, nam_sb } = req.body;
    const params = {
        TableName: tableName,
        Item: {
            "id": id,
            "ten_bao": ten_bao,
            "ten_tacgia": ten_tacgia,
            "isbn": isbn,
            "so_trang": so_trang,
            "nam_sb": nam_sb
        }
    }
    docClient.put(params, (err, data) => {
        if (err) {
            return res.send('errrrrr put')
        } else {
            return res.redirect("/");
        }
    })
})
app.post('/delete', upload.fields([]), (req, res) => {
    const listBao = Object.keys(req.body);

   if(listBao.length===0){
        return res.redirect("/");
    }

    for (let index = 0; index<listBao.length;index++) {
        let params = {
            TableName: tableName,
            Key: {
                "id": Number(listBao[index]),
            }
        };
        docClient.delete(params, (err, data) => {
            if (err) return res.send('delete errrro');
            else{
                if( index === listBao.length-1) //   commit len dùm đi
                    return res.redirect("/");
            }
        })
    }
   


    // if(listBao.length===0){
    //     return res.redirect("/");
    // }
    // function onDeleteItem(index){
    //     const params ={
    //         TableName : tableName,
    //         Key:{
    //             "id":Number(listBao[index]),
    //         }
    //     };
    //     docClient.delete(params,(err,data)=>{
    //         if(err) return res.send('delete errrro');
    //         else {
    //             if (index > 0) {
    //                 onDeleteItem(index - 1);
    //             } else return res.redirect('/');
    //         }
    //     })
    // }
    // onDeleteItem(listBao.length-1);
})


app.listen(PORT, () => {
    console.log(`server is running on port : ${PORT}`);
})