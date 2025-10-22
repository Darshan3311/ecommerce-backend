const mongoose = require('mongoose');
require('dotenv').config();

async function checkRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Role = require('../models/Role.model');
    
    const roles = await Role.find();
    console.log(`\n📊 Total Roles: ${roles.length}`);
    
    if (roles.length === 0) {
      console.log('❌ No roles found! Need to run: npm run seed');
    } else {
      console.log('\n📋 Available Roles:');
      roles.forEach((role, index) => {
        console.log(`${index + 1}. ${role.name} (ID: ${role._id})`);
      });
      
      // Check for required roles
      const requiredRoles = ['Admin', 'Seller', 'Customer'];
      const missingRoles = requiredRoles.filter(name => 
        !roles.find(r => r.name.toLowerCase() === name.toLowerCase())
      );
      
      if (missingRoles.length > 0) {
        console.log('\n⚠️  Missing Roles:', missingRoles.join(', '));
        console.log('   Run: npm run seed');
      } else {
        console.log('\n✅ All required roles exist!');
      }
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkRoles();
