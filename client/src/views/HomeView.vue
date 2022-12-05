<template>
  <v-app>
    <v-main>
      <v-container>
        <template v-if="products.length > 0">
          <v-row>
            <v-col cols="12" sm="6" md="4" lg="3" v-for="product in products" :key="product.id">
              <SingleProduct :item="product" @addToCartEmitted="(data) => { setSnackBar(data); }" />
            </v-col>
          </v-row>
        </template>
      </v-container>
    </v-main>
    <v-dialog v-model="dialog" width="500">
      <v-card class="pa-5">

        <v-card-text>
          {{ dialogText }}
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog = false">
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
        v-model="snackbar"
        :color="snackbarColor"
        right
        :timeout="3000"
    >{{ snackbarText }}</v-snackbar>
  </v-app>
</template>

<script>
  import SingleProduct from "@/components/SingleProduct";

  export default {
    name: 'Home',
    created() {
      this.getProducts();
    },
    components: {
      SingleProduct
    },
    data: () => ({
      products: [],
      dialog: false,
      dialogText: '',
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'green'
    }),
    methods: {
      getProducts() {
        fetch(this.$store.state.baseUrl + 'products', {
          method: 'GET',
        }).then(response => {
          return response.json();
        }).then(data => {
          if (data.status === 200) {
            this.products = data.products
          } else {
            this.snackbar = true;
            this.snackbarText = data.message;
          }
        }).catch(err => {
          this.snackbar = true;
          this.snackbarText = err.message;
        });
      },
      setDialog(text) {
        this.dialog = true;
        this.dialogText = text;
      },
      setSnackBar(data) {
        this.snackbar = true;
        this.snackbarText = data.message;
        this.snackbarColor = data.status === 200 ? 'green' : 'red';
      }
    }
  }
</script>
