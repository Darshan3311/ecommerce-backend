const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const RoleModel = require('../models/Role.model');
const PermissionModel = require('../models/Permission.model');
const UserModel = require('../models/User.model');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await PermissionModel.deleteMany({});
    await RoleModel.deleteMany({});
    await UserModel.deleteMany({});
    console.log('✅ Cleared existing data');

    // ==================== PERMISSIONS ====================
    console.log('\n📝 Creating permissions...');
    
    const permissions = [
      // Product permissions
      { name: 'create_product', description: 'Create new products', resource: 'product', action: 'create' },
      { name: 'read_product', description: 'View products', resource: 'product', action: 'read' },
      { name: 'update_product', description: 'Update products', resource: 'product', action: 'update' },
      { name: 'delete_product', description: 'Delete products', resource: 'product', action: 'delete' },
      
      // User permissions
      { name: 'create_user', description: 'Create users', resource: 'user', action: 'create' },
      { name: 'read_user', description: 'View users', resource: 'user', action: 'read' },
      { name: 'update_user', description: 'Update users', resource: 'user', action: 'update' },
      { name: 'delete_user', description: 'Delete users', resource: 'user', action: 'delete' },
      
      // Order permissions
      { name: 'create_order', description: 'Create orders', resource: 'order', action: 'create' },
      { name: 'read_order', description: 'View orders', resource: 'order', action: 'read' },
      { name: 'update_order', description: 'Update orders', resource: 'order', action: 'update' },
      { name: 'delete_order', description: 'Delete orders', resource: 'order', action: 'delete' },
      
      // Review permissions
      { name: 'create_review', description: 'Create reviews', resource: 'review', action: 'create' },
      { name: 'read_review', description: 'View reviews', resource: 'review', action: 'read' },
      { name: 'update_review', description: 'Update reviews', resource: 'review', action: 'update' },
      { name: 'delete_review', description: 'Delete reviews', resource: 'review', action: 'delete' },
      { name: 'approve_review', description: 'Approve reviews', resource: 'review', action: 'manage' },
    ];

    const createdPermissions = await PermissionModel.insertMany(permissions);
    console.log(`✅ Created ${createdPermissions.length} permissions`);

    // ==================== ROLES ====================
    console.log('\n👥 Creating roles...');

    // Customer Role
    const customerPermissions = createdPermissions.filter(p => 
      ['create_order', 'read_order', 'create_review', 'read_review'].includes(p.name)
    ).map(p => p._id);

    const customerRole = await RoleModel.create({
      name: 'Customer',
      description: 'Regular customer with basic permissions',
      permissions: customerPermissions
    });
    console.log('✅ Created Customer role');

    // Seller Role
    const sellerPermissions = createdPermissions.filter(p => 
      ['create_product', 'read_product', 'update_product', 'read_order', 'update_order', 'read_review'].includes(p.name)
    ).map(p => p._id);

    const sellerRole = await RoleModel.create({
      name: 'Seller',
      description: 'Seller who can manage their products and orders',
      permissions: sellerPermissions
    });
    console.log('✅ Created Seller role');

    // Admin Role - All permissions
    const adminRole = await RoleModel.create({
      name: 'Admin',
      description: 'Administrator with full access',
      permissions: createdPermissions.map(p => p._id)
    });
    console.log('✅ Created Admin role');

    // Support Role
    const supportPermissions = createdPermissions.filter(p => 
      ['read_product', 'read_user', 'read_order', 'update_order', 'read_review', 'approve_review'].includes(p.name)
    ).map(p => p._id);

    const supportRole = await RoleModel.create({
      name: 'Support',
      description: 'Customer support with limited access',
      permissions: supportPermissions
    });
    console.log('✅ Created Support role');

    // ==================== USERS ====================
    console.log('\n👤 Creating default users...');

    // Admin User
    const adminUser = await UserModel.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@eshop.com',
      password: 'admin123', // Will be hashed by the model
      phone: '1234567890',
      role: adminRole._id,
      isEmailVerified: true
    });
    console.log('✅ Created Admin user');
    console.log('   Email: admin@eshop.com');
    console.log('   Password: admin123');

    // Seller User
    const sellerUser = await UserModel.create({
      firstName: 'John',
      lastName: 'Seller',
      email: 'seller@eshop.com',
      password: 'seller123',
      phone: '1234567891',
      role: sellerRole._id,
      isEmailVerified: true
    });
    console.log('✅ Created Seller user');
    console.log('   Email: seller@eshop.com');
    console.log('   Password: seller123');

    // Customer User
    const customerUser = await UserModel.create({
      firstName: 'Jane',
      lastName: 'Customer',
      email: 'customer@eshop.com',
      password: 'customer123',
      phone: '1234567892',
      role: customerRole._id,
      isEmailVerified: true
    });
    console.log('✅ Created Customer user');
    console.log('   Email: customer@eshop.com');
    console.log('   Password: customer123');

    // ==================== SUMMARY ====================
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Database seeding completed successfully!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   Permissions: ${createdPermissions.length}`);
    console.log(`   Roles: 4 (Admin, Seller, Customer, Support)`);
    console.log(`   Users: 3`);
    
    console.log('\n🔐 Default Login Credentials:');
    console.log('\n   ADMIN:');
    console.log('   Email: admin@eshop.com');
    console.log('   Password: admin123');
    console.log('\n   SELLER:');
    console.log('   Email: seller@eshop.com');
    console.log('   Password: seller123');
    console.log('\n   CUSTOMER:');
    console.log('   Email: customer@eshop.com');
    console.log('   Password: customer123');
    
    console.log('\n💡 You can now:');
    console.log('   1. Start the backend: npm start');
    console.log('   2. Login with any of the above credentials');
    console.log('   3. Admin can access all features');
    console.log('   4. Seller can create/manage products');
    console.log('   5. Customer can browse and order');
    console.log('\n' + '='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
