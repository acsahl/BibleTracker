module.exports = {
  webpack: {
    configure: {
      module: {
        rules: [
          {
            test: /\.js$/,
            enforce: 'pre',
            use: ['source-map-loader'],
          },
        ],
      },
    },
  },
  eslint: {
    enable: true,
    mode: 'file',
    configure: {
      rules: {
        'react-hooks/exhaustive-deps': 'warn',
        'no-unused-vars': 'warn'
      }
    }
  },
  babel: {
    presets: [
      [
        '@babel/preset-react',
        {
          runtime: 'automatic'
        }
      ]
    ]
  }
}; 