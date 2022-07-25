module.exports = {
  publicPath: './',
  devServer: {
    // https: true,
    disableHostCheck: true,
    proxy: {
      '/edgerApi': {
        target: 'https://192.168.128.1:7375',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/edgerApi': '',
        },
      },
      '/socket.io': {
        target: 'https://192.168.128.1:7369',
        ws: true,
        changeOrigin: true,
      },
    },
  },
};
