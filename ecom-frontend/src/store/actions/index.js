import api from "../../api/api";

/*
  Redux actions for:
  - products, categories
  - cart operations
  - auth (signin, signup, logout)
  - user addresses
  - orders, payments
  - admin/seller dashboard actions
*/

export const fetchProducts = (queryString) => async (dispatch) => {
  try {
    dispatch({ type: "IS_FETCHING" });
    const { data } = await api.get(`/public/products?${queryString}`);
    dispatch({
      type: "FETCH_PRODUCTS",
      payload: data.content,
      pageNumber: data.pageNumber,
      pageSize: data.pageSize,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      lastPage: data.lastPage,
    });
    dispatch({ type: "IS_SUCCESS" });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to fetch products",
    });
  }
};

export const fetchCategories = () => async (dispatch) => {
  try {
    dispatch({ type: "CATEGORY_LOADER" });
    const { data } = await api.get(`/public/categories`);
    dispatch({
      type: "FETCH_CATEGORIES",
      payload: data.content,
      pageNumber: data.pageNumber,
      pageSize: data.pageSize,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      lastPage: data.lastPage,
    });
    // fixed: on success dispatch success (not IS_ERROR)
    dispatch({ type: "CATEGORY_SUCCESS" });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to fetch categories",
    });
  }
};

export const addToCart = (data, qty = 1, toast) => (dispatch, getState) => {
  // Find the product
  const { products } = getState().products;
  const getProduct = products.find((item) => item.productId === data.productId);

  // If product not found in products state, treat as out of stock
  if (!getProduct) {
    toast.error("Product not found");
    return;
  }

  // Check for stocks
  const isQuantityExist = getProduct.quantity >= qty;

  // If in stock -> add
  if (isQuantityExist) {
    dispatch({ type: "ADD_CART", payload: { ...data, quantity: qty } });
    toast?.success && toast.success(`${data?.productName} added to the cart`);
    localStorage.setItem("cartItems", JSON.stringify(getState().carts.cart));
  } else {
    // error
    toast?.error && toast.error("Out of stock");
  }
};

export const increaseCartQuantity =
  (data, toast, currentQuantity, setCurrentQuantity) =>
  (dispatch, getState) => {
    // Find the product
    const { products } = getState().products;

    const getProduct = products.find(
      (item) => item.productId === data.productId
    );

    if (!getProduct) {
      toast?.error && toast.error("Product not found");
      return;
    }

    // check if stock is available for +1
    const isQuantityExist = getProduct.quantity >= currentQuantity + 1;

    if (isQuantityExist) {
      const newQuantity = currentQuantity + 1;
      setCurrentQuantity && setCurrentQuantity(newQuantity);

      // fixed: payload quantity should be newQuantity, not newQuantity + 1
      dispatch({
        type: "ADD_CART",
        payload: { ...data, quantity: newQuantity },
      });
      localStorage.setItem("cartItems", JSON.stringify(getState().carts.cart));
    } else {
      toast?.error && toast.error("Quantity Reached to Limit");
    }
  };

export const decreaseCartQuantity = (data, newQuantity) => (dispatch, getState) => {
  dispatch({
    type: "ADD_CART",
    payload: { ...data, quantity: newQuantity },
  });
  localStorage.setItem("cartItems", JSON.stringify(getState().carts.cart));
};

export const removeFromCart = (data, toast) => (dispatch, getState) => {
  dispatch({ type: "REMOVE_CART", payload: data });
  toast?.success && toast.success(`${data.productName} removed from cart`);
  localStorage.setItem("cartItems", JSON.stringify(getState().carts.cart));
};

// ----------------- Auth -----------------

export const authenticateSignInUser =
  (sendData, toast, reset, navigate, setLoader) => async (dispatch) => {
    try {
      setLoader && setLoader(true);
      // FIXED: use /api/auth/signin to match backend mapping
      const { data } = await api.post("/api/auth/signin", sendData);
      dispatch({ type: "LOGIN_USER", payload: data });
      localStorage.setItem("auth", JSON.stringify(data));
      reset && reset();
      toast?.success && toast.success("Login Success");
      navigate && navigate("/");
    } catch (error) {
      console.log(error);
      toast?.error &&
        toast.error(error?.response?.data?.message || "Internal Server Error");
    } finally {
      setLoader && setLoader(false);
    }
  };

export const registerNewUser =
  (sendData, toast, reset, navigate, setLoader) => async (dispatch) => {
    try {
      setLoader && setLoader(true);
      // FIXED: use /api/auth/signup
      const { data } = await api.post("/api/auth/signup", sendData);
      reset && reset();
      toast?.success && toast.success(data?.message || "User Registered Successfully");
      navigate && navigate("/login");
    } catch (error) {
      console.log(error);
      toast?.error &&
        toast.error(
          error?.response?.data?.message ||
            error?.response?.data?.password ||
            "Internal Server Error"
        );
    } finally {
      setLoader && setLoader(false);
    }
  };

export const logOutUser = (navigate) => (dispatch) => {
  dispatch({ type: "LOG_OUT" });
  localStorage.removeItem("auth");
  navigate && navigate("/login");
};

// ----------------- Addresses -----------------

export const addUpdateUserAddress =
  (sendData, toast, addressId, setOpenAddressModal) => async (dispatch, getState) => {
    /*
    If your backend requires Authorization header:
    const { user } = getState().auth;
    await api.post(`/addresses`, sendData, {
      headers: { Authorization: "Bearer " + user.jwtToken },
    });
    */
    dispatch({ type: "BUTTON_LOADER" });
    try {
      if (!addressId) {
        const { data } = await api.post("/addresses", sendData);
      } else {
        await api.put(`/addresses/${addressId}`, sendData);
      }
      dispatch(getUserAddresses());
      toast?.success && toast.success("Address saved successfully");
      dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
      console.log(error);
      toast?.error &&
        toast.error(error?.response?.data?.message || "Internal Server Error");
      dispatch({ type: "IS_ERROR", payload: null });
    } finally {
      setOpenAddressModal && setOpenAddressModal(false);
    }
  };

export const deleteUserAddress =
  (toast, addressId, setOpenDeleteModal) => async (dispatch, getState) => {
    try {
      dispatch({ type: "BUTTON_LOADER" });
      await api.delete(`/addresses/${addressId}`);
      dispatch({ type: "IS_SUCCESS" });
      dispatch(getUserAddresses());
      dispatch(clearCheckoutAddress());
      toast?.success && toast.success("Address deleted successfully");
    } catch (error) {
      console.log(error);
      dispatch({
        type: "IS_ERROR",
        payload: error?.response?.data?.message || "Some Error Occured",
      });
    } finally {
      setOpenDeleteModal && setOpenDeleteModal(false);
    }
  };

export const clearCheckoutAddress = () => {
  return {
    type: "REMOVE_CHECKOUT_ADDRESS",
  };
};

export const getUserAddresses = () => async (dispatch, getState) => {
  try {
    dispatch({ type: "IS_FETCHING" });
    const { data } = await api.get(`/addresses`);
    dispatch({ type: "USER_ADDRESS", payload: data });
    dispatch({ type: "IS_SUCCESS" });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to fetch user addresses",
    });
  }
};

export const selectUserCheckoutAddress = (address) => {
  localStorage.setItem("CHECKOUT_ADDRESS", JSON.stringify(address));

  return {
    type: "SELECT_CHECKOUT_ADDRESS",
    payload: address,
  };
};

// ----------------- Payment & Cart -> Server -----------------

export const addPaymentMethod = (method) => {
  return {
    type: "ADD_PAYMENT_METHOD",
    payload: method,
  };
};

export const createUserCart = (sendCartItems) => async (dispatch, getState) => {
  try {
    dispatch({ type: "IS_FETCHING" });
    await api.post("/cart/create", sendCartItems);
    await dispatch(getUserCart());
  } catch (error) {
    console.log(error);
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to create cart items",
    });
  }
};

export const getUserCart = () => async (dispatch, getState) => {
  try {
    dispatch({ type: "IS_FETCHING" });
    const { data } = await api.get("/carts/users/cart");

    dispatch({
      type: "GET_USER_CART_PRODUCTS",
      payload: data.products,
      totalPrice: data.totalPrice,
      cartId: data.cartId,
    });
    localStorage.setItem("cartItems", JSON.stringify(getState().carts.cart));
    dispatch({ type: "IS_SUCCESS" });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to fetch cart items",
    });
  }
};

// ----------------- Orders / Stripe -----------------

export const createStripePaymentSecret = (sendData) => async (dispatch, getState) => {
  try {
    dispatch({ type: "IS_FETCHING" });
    const { data } = await api.post("/order/stripe-client-secret", sendData);
    dispatch({ type: "CLIENT_SECRET", payload: data });
    localStorage.setItem("client-secret", JSON.stringify(data));
    dispatch({ type: "IS_SUCCESS" });
  } catch (error) {
    console.log(error);
    // toast isn't provided here in signature earlier; keep console and dispatch
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to create client secret",
    });
  }
};

export const stripePaymentConfirmation =
  (sendData, setErrorMesssage, setLoadng, toast) => async (dispatch, getState) => {
    try {
      const response = await api.post("/order/users/payments/online", sendData);
      if (response.data) {
        localStorage.removeItem("CHECKOUT_ADDRESS");
        localStorage.removeItem("cartItems");
        localStorage.removeItem("client-secret");
        dispatch({ type: "REMOVE_CLIENT_SECRET_ADDRESS" });
        dispatch({ type: "CLEAR_CART" });
        toast?.success && toast.success("Order Accepted");
      } else {
        setErrorMesssage && setErrorMesssage("Payment Failed. Please try again.");
      }
    } catch (error) {
      setErrorMesssage && setErrorMesssage("Payment Failed. Please try again.");
    }
  };

// ----------------- Analytics & Dashboard -----------------

export const analyticsAction = () => async (dispatch, getState) => {
  try {
    dispatch({ type: "IS_FETCHING" });
    const { data } = await api.get("/admin/app/analytics");
    dispatch({
      type: "FETCH_ANALYTICS",
      payload: data,
    });
    dispatch({ type: "IS_SUCCESS" });
  } catch (error) {
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to fetch analytics data",
    });
  }
};

export const getOrdersForDashboard = (queryString, isAdmin) => async (dispatch) => {
  try {
    dispatch({ type: "IS_FETCHING" });
    const endpoint = isAdmin ? "/admin/orders" : "/seller/orders";
    const { data } = await api.get(`${endpoint}?${queryString}`);
    dispatch({
      type: "GET_ADMIN_ORDERS",
      payload: data.content,
      pageNumber: data.pageNumber,
      pageSize: data.pageSize,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      lastPage: data.lastPage,
    });
    dispatch({ type: "IS_SUCCESS" });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to fetch orders data",
    });
  }
};

export const updateOrderStatusFromDashboard =
  (orderId, orderStatus, toast, setLoader, isAdmin) => async (dispatch, getState) => {
    try {
      setLoader && setLoader(true);
      const endpoint = isAdmin ? "/admin/orders/" : "/seller/orders/";
      const { data } = await api.put(`${endpoint}${orderId}/status`, { status: orderStatus });
      toast?.success && toast.success(data.message || "Order updated successfully");
      await dispatch(getOrdersForDashboard());
    } catch (error) {
      console.log(error);
      toast?.error && toast.error(error?.response?.data?.message || "Internal Server Error");
    } finally {
      setLoader && setLoader(false);
    }
  };

export const dashboardProductsAction = (queryString, isAdmin) => async (dispatch) => {
  try {
    dispatch({ type: "IS_FETCHING" });
    const endpoint = isAdmin ? "/admin/products" : "/seller/products";
    const { data } = await api.get(`${endpoint}?${queryString}`);
    dispatch({
      type: "FETCH_PRODUCTS",
      payload: data.content,
      pageNumber: data.pageNumber,
      pageSize: data.pageSize,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      lastPage: data.lastPage,
    });
    dispatch({ type: "IS_SUCCESS" });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to fetch dashboard products",
    });
  }
};

export const updateProductFromDashboard =
  (sendData, toast, reset, setLoader, setOpen, isAdmin) => async (dispatch) => {
    try {
      setLoader && setLoader(true);
      const endpoint = isAdmin ? "/admin/products/" : "/seller/products/";
      await api.put(`${endpoint}${sendData.id}`, sendData);
      toast?.success && toast.success("Product update successful");
      reset && reset();
      setLoader && setLoader(false);
      setOpen && setOpen(false);
      await dispatch(dashboardProductsAction());
    } catch (error) {
      console.log(error);
      toast?.error && toast.error(error?.response?.data?.description || "Product update failed");
    }
  };

export const addNewProductFromDashboard =
  (sendData, toast, reset, setLoader, setOpen, isAdmin) =>
  async (dispatch, getState) => {
    try {
      setLoader && setLoader(true);
      const endpoint = isAdmin ? "/admin/categories/" : "/seller/categories/";
      await api.post(`${endpoint}${sendData.categoryId}/product`, sendData);
      toast?.success && toast.success("Product created successfully");
      reset && reset();
      setOpen && setOpen(false);
      await dispatch(dashboardProductsAction());
    } catch (err) {
      console.error(err);
      toast?.error && toast.error(err?.response?.data?.description || "Product creation failed");
    } finally {
      setLoader && setLoader(false);
    }
  };

export const deleteProduct =
  (setLoader, productId, toast, setOpenDeleteModal, isAdmin) =>
  async (dispatch, getState) => {
    try {
      setLoader && setLoader(true);
      const endpoint = isAdmin ? "/admin/products/" : "/seller/products/";
      await api.delete(`${endpoint}${productId}`);
      toast?.success && toast.success("Product deleted successfully");
      setLoader && setLoader(false);
      setOpenDeleteModal && setOpenDeleteModal(false);
      await dispatch(dashboardProductsAction());
    } catch (error) {
      console.log(error);
      toast?.error && toast.error(error?.response?.data?.message || "Some Error Occured");
    }
  };

export const updateProductImageFromDashboard =
  (formData, productId, toast, setLoader, setOpen, isAdmin) => async (dispatch) => {
    try {
      setLoader && setLoader(true);
      const endpoint = isAdmin ? "/admin/products/" : "/seller/products/";
      await api.put(`${endpoint}${productId}/image`, formData);
      toast?.success && toast.success("Image upload successful");
      setLoader && setLoader(false);
      setOpen && setOpen(false);
      await dispatch(dashboardProductsAction());
    } catch (error) {
      console.log(error);
      toast?.error && toast.error(error?.response?.data?.description || "Product Image upload failed");
    }
  };

export const getAllCategoriesDashboard = (queryString) => async (dispatch) => {
  dispatch({ type: "CATEGORY_LOADER" });
  try {
    const { data } = await api.get(`/public/categories?${queryString}`);
    dispatch({
      type: "FETCH_CATEGORIES",
      payload: data["content"],
      pageNumber: data["pageNumber"],
      pageSize: data["pageSize"],
      totalElements: data["totalElements"],
      totalPages: data["totalPages"],
      lastPage: data["lastPage"],
    });

    dispatch({ type: "CATEGORY_SUCCESS" });
  } catch (err) {
    console.log(err);

    dispatch({
      type: "IS_ERROR",
      payload: err?.response?.data?.message || "Failed to fetch categories",
    });
  }
};

export const createCategoryDashboardAction =
  (sendData, setOpen, reset, toast) => async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });
      await api.post("/admin/categories", sendData);
      dispatch({ type: "CATEGORY_SUCCESS" });
      reset && reset();
      toast?.success && toast.success("Category Created Successful");
      setOpen && setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast?.error && toast.error(err?.response?.data?.categoryName || "Failed to create new category");

      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };

export const updateCategoryDashboardAction =
  (sendData, setOpen, categoryID, reset, toast) =>
  async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });

      await api.put(`/admin/categories/${categoryID}`, sendData);

      dispatch({ type: "CATEGORY_SUCCESS" });

      reset && reset();
      toast?.success && toast.success("Category Update Successful");
      setOpen && setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast?.error && toast.error(err?.response?.data?.categoryName || "Failed to update category");

      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };

export const deleteCategoryDashboardAction =
  (setOpen, categoryID, toast) => async (dispatch, getState) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });

      await api.delete(`/admin/categories/${categoryID}`);

      dispatch({ type: "CATEGORY_SUCCESS" });

      toast?.success && toast.success("Category Delete Successful");
      setOpen && setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast?.error && toast.error(err?.response?.data?.message || "Failed to delete category");
      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };

export const getAllSellersDashboard =
  (queryString) => async (dispatch, getState) => {
    // If this endpoint requires auth header, ensure api instance sends token
    try {
      dispatch({ type: "IS_FETCHING" });
      // FIXED: use /api/auth/sellers to match backend AuthController mapping
      const { data } = await api.get(`/api/auth/sellers?${queryString}`);
      dispatch({
        type: "GET_SELLERS",
        payload: data["content"],
        pageNumber: data["pageNumber"],
        pageSize: data["pageSize"],
        totalElements: data["totalElements"],
        totalPages: data["totalPages"],
        lastPage: data["lastPage"],
      });

      dispatch({ type: "IS_SUCCESS" });
    } catch (err) {
      console.log(err);
      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Failed to fetch sellers data",
      });
    }
  };

export const addNewDashboardSeller =
  (sendData, toast, reset, setOpen, setLoader) => async (dispatch) => {
    try {
      setLoader && setLoader(true);
      // signup for seller (backend expects /api/auth/signup)
      await api.post("/api/auth/signup", sendData);
      reset && reset();
      toast?.success && toast.success("Seller registered successfully!");

      await dispatch(getAllSellersDashboard());
    } catch (err) {
      console.log(err);
      toast?.error &&
        toast.error(
          err?.response?.data?.message ||
            err?.response?.data?.password ||
            "Internal Server Error"
        );
    } finally {
      setLoader && setLoader(false);
      setOpen && setOpen(false);
    }
  };
