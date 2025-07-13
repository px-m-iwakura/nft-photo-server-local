const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const User = require('./models/User');
const Photo = require('./models/Photo');
const BlockchainService = require('./services/blockchainService');

const app = express();
const port = process.env.PORT || 3000;

// ミドルウェア
app.use(helmet());
app.use(cors());
app.use(express.json());

// レート制限
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use('/api/', limiter);

// MongoDB接続
const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/nft_db';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// ブロックチェーンサービス初期化
const blockchainService = new BlockchainService();

// テストデータ初期化
async function initializeTestData() {
  try {
    const testUsers = [
      {
        blockchain_account_address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        nickname: 'Alice (Ganache #0)'
      },
      {
        blockchain_account_address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        nickname: 'Bob (Ganache #1)'
      }
    ];

    const testPhotos = [
      {
        hash: 'local_photo_hash_001',
        instagram_photo_url: 'https://instagram.com/p/local_test_photo_001',
        blockchain_account_address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        likes: 150,
        upload_status: 'pending'
      },
      {
        hash: 'local_photo_hash_002',
        instagram_photo_url: 'https://instagram.com/p/local_test_photo_002',
        blockchain_account_address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        likes: 89,
        upload_status: 'pending'
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ 
        blockchain_account_address: userData.blockchain_account_address 
      });
      if (!existingUser) {
        await User.create(userData);
        console.log(' Test user created:', userData.nickname);
      }
    }

    for (const photoData of testPhotos) {
      const existingPhoto = await Photo.findOne({ hash: photoData.hash });
      if (!existingPhoto) {
        await Photo.create(photoData);
        console.log(' Test photo created:', photoData.hash);
      }
    }

    console.log('=== テストデータ初期化完了 ===');

  } catch (error) {
    console.error('テストデータ初期化エラー:', error);
  }
}

// MongoDB接続時の初期化
mongoose.connection.once('open', async () => {
  console.log(' MongoDB connected');
  await initializeTestData();
});

// === API エンドポイント ===

// 写真のThingsToken登録
app.post('/api/register-photo', async (req, res) => {
  try {
    const { hash, instaPhotoUrl, likeCount } = req.body;

    if (!hash || !instaPhotoUrl || likeCount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'ハッシュ、Instagram写真URL、いいね数は必須です'
      });
    }

    console.log('Registration request:', { hash, instaPhotoUrl, likeCount });

    const photo = await Photo.findOne({ hash });
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'ハッシュに対応する写真が見つかりません'
      });
    }

    const userAddress = photo.blockchain_account_address;
    console.log(' User address found:', userAddress);

    try {
      const tokenId = await blockchainService.mint(userAddress, 2, likeCount);
      await blockchainService.setTokenURI(tokenId, instaPhotoUrl);

      await Photo.findByIdAndUpdate(photo._id, {
        token_id: tokenId.toString(),
        upload_status: 'completed',
        likes: likeCount,
        instagram_photo_url: instaPhotoUrl,
        updated_at: new Date()
      });

      res.json({
        success: true,
        tokenId: tokenId,
        userAddress: userAddress,
        slot: 2,
        value: likeCount,
        instaPhotoUrl: instaPhotoUrl,
        hash: hash,
        network: 'Local (Ganache)'
      });

    } catch (blockchainError) {
      console.error('Blockchain error:', blockchainError);
      res.status(500).json({
        success: false,
        error: 'ブロックチェーン処理中にエラーが発生しました',
        details: blockchainError.message
      });
    }

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました',
      details: error.message
    });
  }
});

// 写真一覧取得
app.get('/api/photos', async (req, res) => {
  try {
    const photos = await Photo.find().sort({ created_at: -1 });
    res.json({ success: true, photos });
  } catch (error) {
    res.status(500).json({ success: false, error: '写真取得エラー' });
  }
});

// ユーザー一覧取得
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ nickname: 1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ユーザー取得エラー' });
  }
});

// ネットワーク情報取得
app.get('/api/network', async (req, res) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo();
    res.json({ success: true, networkInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ネットワーク情報取得エラー' });
  }
});

// ヘルスチェック
app.get('/health', async (req, res) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo();
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      blockchain: {
        network: 'Local (Ganache)',
        chainId: process.env.CHAIN_ID || '1337',
        contractAddress: process.env.CONTRACT_ADDRESS,
        blockNumber: networkInfo?.blockNumber || 'N/A'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'サーバー内部エラーが発生しました'
  });
});

// サーバー起動
app.listen(port, '0.0.0.0', () => {
  console.log(' NFT Photo Server running on port ' + port);
  console.log('Environment: ' + (process.env.NODE_ENV || 'development'));
});
