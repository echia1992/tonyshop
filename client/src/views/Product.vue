<template>
  <v-app>
    <v-main>
      <v-row>
        <v-col cols="12" sm="10" md="8" offset-sm="1" offset-md="2">
          <h3 class="mt-10 pa-5">Products</h3>
          <div class="text-right mb-4">
            <v-btn color="primary" @click="productDialog = true">
              Create New
            </v-btn>
          </div>
          <v-simple-table class="pa-5">
            <template v-slot:default>
              <thead>
              <tr>
                <th class="text-center">
                  Image
                </th>
                <th class="text-center">
                  Title
                </th>
                <th class="text-center">
                  Price
                </th>
                <th class="text-center">
                  Last Updated
                </th>
                <th class="text-right">
                  Action
                </th>
              </tr>
              </thead>
              <tbody>
              <tr
                  v-for="item in products"
                  :key="item.id"
              >
                <td class="pa-3">
                  <v-avatar>
                    <img
                        :src="item.imageUrl"
                    >
                  </v-avatar>
                </td>
                <td class="pa-3">{{ item.title }}</td>
                <td class="pa-3">₦{{ item.price.toLocaleString("en-GB") }}</td>
                <td class="pa-3">
                  {{item.updatedAt}}
                </td>
                <td class="text-right pa-3">
                  <v-btn fab color="orange" @click="openEditDialog(item.id)">
                    <v-icon>mdi-square-edit-outline</v-icon>
                  </v-btn>
                  <v-btn class="ml-4" fab color="red" @click="deleteProduct(item.slug)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-col>
      </v-row>
    </v-main>
    <v-dialog
        v-model="productDialog"
        width="500"
    >
      <v-card :loading="newProductloading" :disabled="newProductloading" style="position: relative;">
        <v-card-title class="text-h5">
          Create New Product
        </v-card-title>
        <v-text-field
            label="Title"
            outlined
            class="mx-5"
            v-model="newProduct.title"
        ></v-text-field>
        <v-textarea
            label="Description"
            outlined
            class="mx-5"
            v-model="newProduct.description"
        ></v-textarea>
        <v-select
            :items="categories"
            item-text="name"
            item-value="id"
            label="Category"
            outlined
            class="mx-5"
            v-model="newProduct.category"
        ></v-select>
        <v-select
            :items="variants"
            item-text="name"
            item-value="id"
            label="variant"
            outlined
            class="mx-5"
            v-model="newProduct.variant"
        ></v-select>
        <v-file-input
            label="Image"
            outlined
            class="mx-5"
            @change="uploadAvatar($event)"
            @click:clear="newProduct.imageUrl = ''"
        ></v-file-input>
        <v-img
            :height="300"
            v-if="newProduct.imageUrl !== ''"
            :src="newProduct.imageUrl"
            class="mx-5 mb-4"
            contain
        ></v-img>
        <v-text-field
            label="Price"
            outlined
            type="number"
            class="mx-5"
            v-model="newProduct.price"
        ></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="red"
              text
              @click="productDialog = false"
          >
            Close
          </v-btn>
          <v-btn
              color="primary"
              text
              @click="createProduct"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
        v-model="editProductDialog"
        width="500"
    >
      <v-card :loading="editProductloading" :disabled="editProductloading" style="position: relative;">
        <v-card-title class="text-h5">
          Edit Product
        </v-card-title>
        <v-text-field
            label="Title"
            outlined
            class="mx-5"
            v-model="editProduct.title"
        ></v-text-field>
        <v-textarea
            label="Description"
            outlined
            class="mx-5"
            v-model="editProduct.description"
        ></v-textarea>
        <v-select
            :items="categories"
            item-text="name"
            item-value="id"
            label="Category"
            outlined
            class="mx-5"
            v-model="editProduct.category"
        ></v-select>
        <v-file-input
            label="Image"
            outlined
            class="mx-5"
            @change="uploadAvatar($event,'edit')"
            @click:clear="editProduct.imageUrl = ''"
        ></v-file-input>
        <v-img
            :height="300"
            v-if="editProduct.imageUrl !== ''"
            :src="editProduct.imageUrl"
            class="mx-5 mb-4"
            contain
        ></v-img>
        <v-text-field
            label="Price"
            outlined
            type="number"
            class="mx-5"
            v-model="editProduct.price"
        ></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="red"
              text
              @click="editProductDialog = false"
          >
            Close
          </v-btn>
          <v-btn
              color="primary"
              text
              @click="updateProduct"
          >
            Edit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
        v-model="dialog"
        width="500"
    >
      <v-card class="pa-5">

        <v-card-text>
          {{ dialogText }}
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              text
              @click="dialog = false"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
        v-model="snackbar"
        :color="snackbarColor"
        centered
        :timeout="2000"
    >{{ snackbarText }}</v-snackbar>
  </v-app>
</template>

<script>
export default {
  name: "Product",
  created(){
    this.getCategory();
    this.getProducts();
    this.getVariant()
  },
  data: ()=>({
    dialog: '',
    dialogText: '',
    snackbar: false,
    snackbarText: '',
    snackbarColor: 'success',
    productDialog: false,
    newProductloading: false,
    products: [],
    newProduct: {
      title: '',
      description: '',
      imageUrl: '',
      price: '',
      category: '',
      variant: ''
    },
    editProduct: {
      title: '',
      description: '',
      imageUrl: '',
      price: '',
      category: '',
      variant:'',
      slug: ''
    },
    editProductDialog: false,
    editProductloading: false,
    categories: [],
    variants:[],
    deleteProductLoading: false
  }),
  methods: {
    getProducts(){
      fetch(this.$store.state.baseUrl+'products',{
        method: 'GET',
        headers: {
          'Authorization': this.$store.state.jwt_token
        }
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 200){
          this.products = data.products
        }else{
          this.dialog = true;
          this.dialogText = data.message;
        }
        if(data.status === 401){
          this.$cookies.remove('jwt_token');
          this.$store.commit('setAuth',{
            token: "",
            user: {}
          });
          this.$router.push('/login');
        }
        if(data.status === 403){
          this.$router.push('/');
        }
      }).catch(err=>{
        this.dialog = true;
        this.dialogText = err.message;
      });
    },
    getCategory(){
      fetch(this.$store.state.baseUrl+'category',{
        method: 'GET',
        headers: {
          'Authorization': this.$store.state.jwt_token
        }
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 200){
          this.categories = data.category.map(c=>{
            return {
              name: c.name,
              id: c.id
            }
          });
        }else{
          this.dialog = true;
          this.dialogText = data.message;
        }
        if(data.status === 401){
          this.$cookies.remove('jwt_token');
          this.$store.commit('setAuth',{
            token: "",
            user: {}
          });
          this.$router.push('/login');
        }
        if(data.status === 403){
          this.$router.push('/');
        }
      }).catch(err=>{
        this.dialog = true;
        this.dialogText = err.message;
      });
    },
    getVariant(){
      fetch(this.$store.state.baseUrl+'variant',{
        method: 'GET',
        headers: {
          'Authorization': this.$store.state.jwt_token
        }
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 200){
          this.variants = data.variant.map(v=>{
            return {
              name: v.name,
              id: v.id
            }
          });
        }else{
          this.dialog = true;
          this.dialogText = data.message;
        }
        if(data.status === 401){
          this.$cookies.remove('jwt_token');
          this.$store.commit('setAuth',{
            token: "",
            user: {}
          });
          this.$router.push('/login');
        }
        if(data.status === 403){
          this.$router.push('/');
        }
      }).catch(err=>{
        this.dialog = true;
        this.dialogText = err.message;
      });
    },
    uploadAvatar(event,type='new'){
      if(event == null){
        return;
      }
      let formData = new FormData();
      formData.append("upload",event);
      fetch(this.$store.state.baseUrl+'upload',{
        method: 'put',
        headers: {
          'Authorization': this.$store.state.jwt_token
        },
        body: formData
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 201){
          if(type === 'new'){
            this.newProduct.imageUrl = this.$store.state.baseUrl+data.path;
          }else{
            this.editProduct.imageUrl = this.$store.state.baseUrl+data.path;
          }
        }else{
          this.dialog = true;
          this.dialogText = data.message;
        }
      }).catch(err=>{
        this.dialog = true;
        this.dialogText = err.message;
      });
    },
    createProduct(){
      this.newProductloading = true;
      fetch(this.$store.state.baseUrl+'product',{
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt_token
        },
        body:JSON.stringify({
          title: this.newProduct.title,
          category: this.newProduct.category,
          variant: this.newProduct.variant,
          imageUrl: this.newProduct.imageUrl,
          description: this.newProduct.description,
          price: this.newProduct.price
        })
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 201){
          this.getProducts();
          this.newProduct.title = '';
          this.newProduct.category = '';
          this.newProduct.imageUrl = '';
          this.newProduct.description = '';
          this.newProduct.price = '';
          this.productDialog = false;
        }
        if(data.status === 401){
          this.$cookies.remove('jwt_token');
          this.$store.commit('setAuth',{
            token: "",
            user: {}
          });
          this.$router.push('/login');
        }
        if(data.status === 403){
          this.$router.push('/');
        }
        this.dialog = true;
        this.dialogText = data.message;
        this.newProductloading = false;
      }).catch(err=>{
        this.dialog = true;
        this.dialogText = err.message;
        this.newProductloading = false;
      });
    },
    updateProduct(){
      this.editProductloading = true;
      fetch(this.$store.state.baseUrl+'product/'+this.editProduct.slug,{
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt_token
        },
        body:JSON.stringify({
          title: this.editProduct.title,
          category: this.editProduct.category,
          imageUrl: this.editProduct.imageUrl,
          description: this.editProduct.description,
          price: this.editProduct.price
        })
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 201){
          this.getProducts();
          this.editProduct.title = '';
          this.editProduct.category = '';
          this.editProduct.imageUrl = '';
          this.editProduct.description = '';
          this.editProduct.price = '';
          this.editProductDialog = false;
        }
        this.dialog = true;
        this.snackbarText = data.message;
        this.editProductloading = false;
      }).catch(err=>{
        this.dialog = true;
        this.snackbarText = err.message;
        this.editProductloading = false;
      });
    },
    openEditDialog(id){
      this.editProductDialog = true;
      this.editProduct = this.products.find(product=>{
        return id.toString() === product.id.toString()
      });
      this.editProduct.category = this.editProduct.categoryId;
    },
    deleteProduct(slug){
      if(!confirm('Are you sure you want to delete this product?')){
        return;
      }
      this.deleteProductLoading = true;
      fetch(this.$store.state.baseUrl+'product/'+slug,{
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt_token
        }
      }).then(response=>{
        return response.json();
      }).then(data=>{
        this.deleteProductLoading = false;
        if(data.status === 200){
          this.getProducts();
        }
        this.dialog = true;
        this.snackbarText = data.message;
      }).catch(err=>{
        this.deleteProductLoading = false;
        this.dialog = true;
        this.snackbarText = err.message;
      });
    },
    setSnackBar(data) {
      this.snackbar = true;
      this.snackbarText = data.message;
      this.snackbarColor = data.status === 200 ? 'green' : 'red';
    }
  }
}
</script>

<style scoped>

</style>