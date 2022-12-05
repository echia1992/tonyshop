<template>
  <v-app>
    <v-main>
      <v-row>
        <v-col cols="12" sm="8" md="6" offset-sm="2" offset-md="3">
          <h3 class="mt-10 pa-5">Category</h3>
          <div class="text-right mb-4">
            <v-btn color="primary" @click="categoryDialog = true">
              Create New
            </v-btn>
          </div>
          <v-simple-table class="pa-5">
            <template v-slot:default>
              <thead>
              <tr>
                <th class="text-left">
                  Name
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
                  v-for="item in categories"
                  :key="item.id"
              >
                <td class="pa-3">{{ item.name }}</td>
                <td class="pa-3">
                  {{item.updatedAt}}
                </td>
                <td class="text-right pa-3">
                  <v-btn fab color="orange" @click="openEditDialog(item.slug, item.name)">
                    <v-icon>mdi-square-edit-outline</v-icon>
                  </v-btn>
                  <v-btn class="ml-4" fab color="red" @click="deleteCategory(item.slug)">
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
        v-model="categoryDialog"
        width="500"
    >
      <v-card :loading="newCategoryloading" :disabled="newCategoryloading">
        <v-card-title class="text-h5">
          Create New Category
        </v-card-title>
        <v-text-field
            label="Name"
            outlined
            v-model="newCategoryName"
            class="mx-5"
        ></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="red"
              text
              @click="categoryDialog = false"
          >
            Close
          </v-btn>
          <v-btn
              color="primary"
              text
              @click="createCategory"

          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
        v-model="editCategoryDialog"
        width="500"
    >
      <v-card :loading="editCategoryloading" :disabled="editCategoryloading">
        <v-card-title class="text-h5">
          Edit Category
        </v-card-title>
        <v-text-field
            label="Name"
            outlined
            v-model="categoryToBeEdited"
            class="mx-5"
        ></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="red"
              text
              @click="editCategoryDialog = false"
          >
            Close
          </v-btn>
          <v-btn
              color="primary"
              text
              @click="editCategory"
          >
            Update
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
  </v-app>
</template>

<script>
export default {
  name: "Category",
  created(){
    this.getCategory();
  },
  data: ()=>({
    newCategoryloading: false,
    dialog: false,
    dialogText: '',
    categoryDialog: false,
    newCategoryName: "",
    categories: [],
    editCategoryDialog: false,
    editCategoryloading: false,
    categoryToBeEdited: "",
    categorySlugToBeEdited: '',
    deleteCategoryLoading: false
  }),
  methods:{
    createCategory(){
      this.newCategoryloading = true;
      fetch(this.$store.state.baseUrl+'product/category',{
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt_token
        },
        body:JSON.stringify({
          name: this.newCategoryName
        })
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 201){
          this.newCategoryName = '';
          this.categoryDialog = false;
          this.getCategory();
        }
        this.dialog = true;
        this.dialogText = data.message;
        this.newCategoryloading = false;
      }).catch(err=>{
        this.dialog = true;
        this.dialogText = err.message;
        this.newCategoryloading = false;
      });
    },
    editCategory(){
      this.editCategoryloading = true;
      fetch(this.$store.state.baseUrl+'category/'+this.categorySlugToBeEdited,{
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt_token
        },
        body:JSON.stringify({
          name: this.categoryToBeEdited
        })
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 200){
          this.categoryToBeEdited = '';
          this.editCategoryDialog = false;
          this.getCategory();
        }
        this.dialog = true;
        this.dialogText = data.message;
        this.editCategoryloading = false;
      }).catch(err=>{
        this.dialog = true;
        this.dialogText = err.message;
        this.editCategoryloading = false;
      });
    },
    deleteCategory(slug){
      if(!confirm('Are you sure you want to delete this category?')){
        return;
      }
      this.deleteCategoryLoading = true;
      fetch(this.$store.state.baseUrl+'category/'+slug,{
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.$store.state.jwt_token
        }
      }).then(response=>{
        return response.json();
      }).then(data=>{
        this.deleteCategoryLoading = false;
        if(data.status === 200){
          this.getCategory();
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
      }).catch(err=>{
        this.deleteCategoryLoading = false;
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
          this.categories = data.category
        }else{
          this.dialog = true;
          this.dialogText = data.message;
          this.newCategoryloading = false;
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
        this.newCategoryloading = false;
      });
    },
    openEditDialog(slug, name){
      this.categorySlugToBeEdited = slug;
      this.categoryToBeEdited = name;
      this.editCategoryDialog = true;
    }
  }
}
</script>

<style scoped>

</style>