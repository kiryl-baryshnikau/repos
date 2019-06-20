// Decompiled with JetBrains decompiler
// Type: System.Web.Http.OData.Delta`1
// Assembly: System.Web.Http.OData, Version=5.3.1.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35
// MVID: 11C3A929-0631-4EC5-A680-108ACF984C40
// Assembly location: C:\Users\822616\source\Repos\Solution20\packages\Microsoft.AspNet.WebApi.OData.5.3.1\lib\net45\System.Web.Http.OData.dll

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace WebApplication1.Models
{
    internal static class DeserializationHelpers
    {
        internal static void ApplyProperty(ODataProperty property, IEdmStructuredTypeReference resourceType, object resource, ODataDeserializerProvider deserializerProvider, ODataDeserializerContext readContext)
        {
            IEdmProperty property1 = resourceType.FindProperty(property.Name);
            string name = property.Name;
            IEdmTypeReference type = property1?.Type;
            EdmTypeKind typeKind;
            object obj = DeserializationHelpers.ConvertValue(property.Value, ref type, deserializerProvider, readContext, out typeKind);
            switch (typeKind)
            {
                case EdmTypeKind.Primitive:
                    if (!readContext.IsUntyped)
                    {
                        obj = EdmPrimitiveHelpers.ConvertPrimitiveValue(obj, DeserializationHelpers.GetPropertyType(resource, name));
                        break;
                    }
                    break;
                case EdmTypeKind.Collection:
                    DeserializationHelpers.SetCollectionProperty(resource, property1, obj);
                    return;
            }
            DeserializationHelpers.SetProperty(resource, name, obj);
        }

        internal static void SetCollectionProperty(object resource, IEdmProperty edmProperty, object value)
        {
            DeserializationHelpers.SetCollectionProperty(resource, edmProperty.Name, edmProperty.Type.AsCollection(), value, false);
        }

        internal static void SetCollectionProperty(object resource, string propertyName, IEdmCollectionTypeReference edmPropertyType, object value, bool clearCollection)
        {
            if (value == null)
                return;
            IEnumerable items = value as IEnumerable;
            Type type = resource.GetType();
            Type propertyType = DeserializationHelpers.GetPropertyType(resource, propertyName);
            Type elementType;
            if (!propertyType.IsCollection(out elementType))
                throw new SerializationException(System.Web.Http.Error.Format(SRResources.PropertyIsNotCollection, (object)propertyType.FullName, (object)propertyName, (object)type.FullName));
            IEnumerable instance;
            if (DeserializationHelpers.CanSetProperty(resource, propertyName) && CollectionDeserializationHelpers.TryCreateInstance(propertyType, edmPropertyType, elementType, out instance))
            {
                items.AddToCollection(instance, elementType, type, propertyName, propertyType);
                if (propertyType.IsArray)
                    instance = CollectionDeserializationHelpers.ToArray(instance, elementType);
                DeserializationHelpers.SetProperty(resource, propertyName, (object)instance);
            }
            else
            {
                IEnumerable property = DeserializationHelpers.GetProperty(resource, propertyName) as IEnumerable;
                if (property == null)
                    throw new SerializationException(System.Web.Http.Error.Format(SRResources.CannotAddToNullCollection, (object)propertyName, (object)type.FullName));
                if (clearCollection)
                    property.Clear(propertyName, type);
                items.AddToCollection(property, elementType, type, propertyName, propertyType);
            }
        }

        internal static void SetProperty(object resource, string propertyName, object value)
        {
            IDelta delta = resource as IDelta;
            if (delta == null)
                resource.GetType().GetProperty(propertyName).SetValue(resource, value, (object[])null);
            else
                delta.TrySetPropertyValue(propertyName, value);
        }

        internal static object ConvertValue(object oDataValue, ref IEdmTypeReference propertyType, ODataDeserializerProvider deserializerProvider, ODataDeserializerContext readContext, out EdmTypeKind typeKind)
        {
            if (oDataValue == null)
            {
                typeKind = EdmTypeKind.None;
                return (object)null;
            }
            ODataComplexValue complexValue = oDataValue as ODataComplexValue;
            if (complexValue != null)
            {
                typeKind = EdmTypeKind.Complex;
                return DeserializationHelpers.ConvertComplexValue(complexValue, ref propertyType, deserializerProvider, readContext);
            }
            ODataCollectionValue collection = oDataValue as ODataCollectionValue;
            if (collection != null)
            {
                typeKind = EdmTypeKind.Collection;
                return DeserializationHelpers.ConvertCollectionValue(collection, propertyType, deserializerProvider, readContext);
            }
            typeKind = EdmTypeKind.Primitive;
            return oDataValue;
        }

        internal static Type GetPropertyType(object resource, string propertyName)
        {
            IDelta delta = resource as IDelta;
            if (delta != null)
            {
                Type type;
                delta.TryGetPropertyType(propertyName, out type);
                return type;
            }
            PropertyInfo property = resource.GetType().GetProperty(propertyName);
            if (!(property == (PropertyInfo)null))
                return property.PropertyType;
            return (Type)null;
        }

        private static object ConvertComplexValue(ODataComplexValue complexValue, ref IEdmTypeReference propertyType, ODataDeserializerProvider deserializerProvider, ODataDeserializerContext readContext)
        {
            IEdmComplexTypeReference complexTypeReference = propertyType != null ? propertyType.AsComplex() : (IEdmComplexTypeReference)new EdmComplexTypeReference((IEdmType)readContext.Model.FindType(complexValue.TypeName) as IEdmComplexType, true);
            return deserializerProvider.GetEdmTypeDeserializer((IEdmTypeReference)complexTypeReference).ReadInline((object)complexValue, propertyType, readContext);
        }

        private static bool CanSetProperty(object resource, string propertyName)
        {
            if (resource is IDelta)
                return true;
            PropertyInfo property = resource.GetType().GetProperty(propertyName);
            if (property != (PropertyInfo)null)
                return property.GetSetMethod() != (MethodInfo)null;
            return false;
        }

        private static object GetProperty(object resource, string propertyName)
        {
            IDelta delta = resource as IDelta;
            if (delta == null)
                return resource.GetType().GetProperty(propertyName).GetValue(resource, (object[])null);
            object obj;
            delta.TryGetPropertyValue(propertyName, out obj);
            return obj;
        }

        private static object ConvertCollectionValue(ODataCollectionValue collection, IEdmTypeReference propertyType, ODataDeserializerProvider deserializerProvider, ODataDeserializerContext readContext)
        {
            IEdmCollectionTypeReference collectionTypeReference = propertyType as IEdmCollectionTypeReference;
            return deserializerProvider.GetEdmTypeDeserializer((IEdmTypeReference)collectionTypeReference).ReadInline((object)collection, (IEdmTypeReference)collectionTypeReference, readContext);
        }
    }

    internal class PropertyHelper
    {
        private static ConcurrentDictionary<Type, PropertyHelper[]> _reflectionCache = new ConcurrentDictionary<Type, PropertyHelper[]>();
        private static readonly MethodInfo _callPropertyGetterOpenGenericMethod = typeof(PropertyHelper).GetMethod("CallPropertyGetter", BindingFlags.Static | BindingFlags.NonPublic);
        private static readonly MethodInfo _callPropertyGetterByReferenceOpenGenericMethod = typeof(PropertyHelper).GetMethod("CallPropertyGetterByReference", BindingFlags.Static | BindingFlags.NonPublic);
        private static readonly MethodInfo _callPropertySetterOpenGenericMethod = typeof(PropertyHelper).GetMethod("CallPropertySetter", BindingFlags.Static | BindingFlags.NonPublic);
        private Func<object, object> _valueGetter;

        public PropertyHelper(PropertyInfo property)
        {
            this.Name = property.Name;
            this._valueGetter = PropertyHelper.MakeFastPropertyGetter(property);
        }

        public static Action<TDeclaringType, object> MakeFastPropertySetter<TDeclaringType>(PropertyInfo propertyInfo) where TDeclaringType : class
        {
            MethodInfo setMethod = propertyInfo.GetSetMethod();
            Type reflectedType = propertyInfo.ReflectedType;
            Type parameterType = setMethod.GetParameters()[0].ParameterType;
            return (Action<TDeclaringType, object>)Delegate.CreateDelegate(typeof(Action<TDeclaringType, object>), (object)setMethod.CreateDelegate(typeof(Action<,>).MakeGenericType(reflectedType, parameterType)), PropertyHelper._callPropertySetterOpenGenericMethod.MakeGenericMethod(reflectedType, parameterType));
        }

        public virtual string Name { get; protected set; }

        public object GetValue(object instance)
        {
            return this._valueGetter(instance);
        }

        public static PropertyHelper[] GetProperties(object instance)
        {
            return PropertyHelper.GetProperties(instance, new Func<PropertyInfo, PropertyHelper>(PropertyHelper.CreateInstance), PropertyHelper._reflectionCache);
        }

        public static Func<object, object> MakeFastPropertyGetter(PropertyInfo propertyInfo)
        {
            MethodInfo getMethod = propertyInfo.GetGetMethod();
            Type reflectedType = getMethod.ReflectedType;
            Type returnType = getMethod.ReturnType;
            Delegate @delegate;
            if (reflectedType.IsValueType)
                @delegate = Delegate.CreateDelegate(typeof(Func<object, object>), (object)getMethod.CreateDelegate(typeof(PropertyHelper.ByRefFunc<,>).MakeGenericType(reflectedType, returnType)), PropertyHelper._callPropertyGetterByReferenceOpenGenericMethod.MakeGenericMethod(reflectedType, returnType));
            else
                @delegate = Delegate.CreateDelegate(typeof(Func<object, object>), (object)getMethod.CreateDelegate(typeof(Func<,>).MakeGenericType(reflectedType, returnType)), PropertyHelper._callPropertyGetterOpenGenericMethod.MakeGenericMethod(reflectedType, returnType));
            return (Func<object, object>)@delegate;
        }

        private static PropertyHelper CreateInstance(PropertyInfo property)
        {
            return new PropertyHelper(property);
        }

        private static object CallPropertyGetter<TDeclaringType, TValue>(Func<TDeclaringType, TValue> getter, object @this)
        {
            return (object)getter((TDeclaringType)@this);
        }

        private static object CallPropertyGetterByReference<TDeclaringType, TValue>(PropertyHelper.ByRefFunc<TDeclaringType, TValue> getter, object @this)
        {
            TDeclaringType declaringType = (TDeclaringType)@this;
            return (object)getter(ref declaringType);
        }

        private static void CallPropertySetter<TDeclaringType, TValue>(Action<TDeclaringType, TValue> setter, object @this, object value)
        {
            setter((TDeclaringType)@this, (TValue)value);
        }

        protected static PropertyHelper[] GetProperties(object instance, Func<PropertyInfo, PropertyHelper> createPropertyHelper, ConcurrentDictionary<Type, PropertyHelper[]> cache)
        {
            Type type = instance.GetType();
            PropertyHelper[] array;
            if (!cache.TryGetValue(type, out array))
            {
                IEnumerable<PropertyInfo> propertyInfos = ((IEnumerable<PropertyInfo>)type.GetProperties(BindingFlags.Instance | BindingFlags.Public)).Where<PropertyInfo>((Func<PropertyInfo, bool>)(prop =>
                {
                    if (prop.GetIndexParameters().Length == 0)
                        return prop.GetMethod != (MethodInfo)null;
                    return false;
                }));
                List<PropertyHelper> propertyHelperList = new List<PropertyHelper>();
                foreach (PropertyInfo propertyInfo in propertyInfos)
                {
                    PropertyHelper propertyHelper = createPropertyHelper(propertyInfo);
                    propertyHelperList.Add(propertyHelper);
                }
                array = propertyHelperList.ToArray();
                cache.TryAdd(type, array);
            }
            return array;
        }

        private delegate TValue ByRefFunc<TDeclaringType, TValue>(ref TDeclaringType arg);

    }

    internal static class EdmLibHelpers
    {
        public static bool IsNullable(Type type)
        {
            if (type.IsValueType)
                return Nullable.GetUnderlyingType(type) != (Type)null;
            return true;
        }
    }

    internal static class TypeHelper
    {
        public static bool IsCollection(this Type type)
        {
            Type elementType;
            return type.IsCollection(out elementType);
        }

        public static bool IsCollection(this Type type, out Type elementType)
        {
            if (type == (Type)null)
                throw new ArgumentNullException(nameof(type));
            elementType = type;
            if (type == typeof(string))
                return false;
            Type type1 = ((IEnumerable<Type>)type.GetInterfaces()).Union<Type>((IEnumerable<Type>)new Type[1]
            {
                type
            }).FirstOrDefault<Type>((Func<Type, bool>)(t =>
            {
                if (t.IsGenericType)
                    return t.GetGenericTypeDefinition() == typeof(IEnumerable<>);
                return false;
            }));
            if (!(type1 != (Type)null))
                return false;
            elementType = ((IEnumerable<Type>)type1.GetGenericArguments()).Single<Type>();
            return true;
        }
    }

    internal abstract class PropertyAccessor<TEntityType> where TEntityType : class
    {
        protected PropertyAccessor(PropertyInfo property)
        {
            if (property == (PropertyInfo)null)
                throw new ArgumentNullException(nameof(property));
            this.Property = property;
            if (this.Property.GetGetMethod() == (MethodInfo)null || !this.Property.PropertyType.IsCollection() && this.Property.GetSetMethod() == (MethodInfo)null)
                throw new ArgumentException(nameof(property), "$PropertyMustHavePublicGetterAndSetter");
        }

        public PropertyInfo Property { get; private set; }

        public void Copy(TEntityType from, TEntityType to)
        {
            if ((object)from == null)
                throw new ArgumentNullException(nameof(from));
            if ((object)to == null)
                throw new ArgumentNullException(nameof(to));
            this.SetValue(to, this.GetValue(from));
        }

        public abstract object GetValue(TEntityType entity);

        public abstract void SetValue(TEntityType entity, object value);
    }

    internal class FastPropertyAccessor<TEntityType> : PropertyAccessor<TEntityType> where TEntityType : class
    {
        private bool _isCollection;
        private PropertyInfo _property;
        private Action<TEntityType, object> _setter;
        private Func<object, object> _getter;

        public FastPropertyAccessor(PropertyInfo property)
          : base(property)
        {
            this._property = property;
            this._isCollection = property.PropertyType.IsCollection();
            if (!this._isCollection)
                this._setter = PropertyHelper.MakeFastPropertySetter<TEntityType>(property);
            this._getter = PropertyHelper.MakeFastPropertyGetter(property);
        }

        public override object GetValue(TEntityType entity)
        {
            if ((object)entity == null)
                throw new ArgumentNullException(nameof(entity));
            return this._getter((object)entity);
        }

        public override void SetValue(TEntityType entity, object value)
        {
            if ((object)entity == null)
                throw new ArgumentNullException(nameof(entity));
            if (this._isCollection)
                DeserializationHelpers.SetCollectionProperty((object)entity, this._property.Name, (IEdmCollectionTypeReference)null, value, true);
            else
                this._setter(entity, value);
        }
    }

    /// <summary>A class the tracks changes (i.e. the delta) for a particular <paramref name="TEntityType" />.</summary>
    /// <typeparam name="TEntityType">TEntityType is the base type of entity this delta tracks changes for.</typeparam>
    //????[NonValidatingParameterBinding]
    public class Delta<TEntityType> where TEntityType : class
    {
        private static ConcurrentDictionary<Type, Dictionary<string, PropertyAccessor<TEntityType>>> _propertyCache = new ConcurrentDictionary<Type, Dictionary<string, PropertyAccessor<TEntityType>>>();
        private Dictionary<string, PropertyAccessor<TEntityType>> _allProperties;
        private HashSet<string> _updatableProperties;
        private HashSet<string> _changedProperties;
        private TEntityType _entity;
        private Type _entityType;

        /// <summary>Initializes a new instance of <see cref="T:System.Web.Http.OData.Delta`1" />.</summary>
        public Delta()
          : this(typeof(TEntityType))
        {
        }

        /// <summary>Initializes a new instance of <see cref="T:System.Web.Http.OData.Delta`1" />.</summary>
        /// <param name="entityType">The derived entity type for which the changes would be tracked. <paramref name="entityType" /> should be assignable to instances of <paramref name="TEntityType" />.</param>
        public Delta(Type entityType)
          : this(entityType, (IEnumerable<string>)null)
        {
        }

        /// <summary>Initializes a new instance of <see cref="T:System.Web.Http.OData.Delta`1" />.</summary>
        /// <param name="entityType">The derived entity type for which the changes would be tracked. <paramref name="entityType" /> should be assignable to instances of <paramref name="TEntityType" />.</param>
        /// <param name="updatableProperties">The set of properties that can be updated or reset.</param>
        public Delta(Type entityType, IEnumerable<string> updatableProperties)
        {
            this.Reset(entityType);
            this.InitializeProperties(updatableProperties);
        }

        /// <summary>Gets the actual type of the entity for which the changes are tracked.</summary>
        /// <returns>The actual type of the entity for which the changes are tracked.</returns>
        public Type EntityType
        {
            get
            {
                return this._entityType;
            }
        }

        /// <returns>Returns <see cref="T:System.Type" />.</returns>
        public Type ExpectedClrType
        {
            get
            {
                return typeof(TEntityType);
            }
        }

        /// <summary>Clears the Delta and resets the underlying Entity.</summary>
        public void Clear()
        {
            this.Reset(this._entityType);
        }

        /// <returns>Returns <see cref="T:System.Collections.Generic.IEnumerable`1" />.</returns>
        public IEnumerable<string> GetDynamicMemberNames()
        {
            return (IEnumerable<string>)this._allProperties.Keys;
        }

        /// <summary>Attempts to set the property called <paramref name="name" /> to the <paramref name="value" /> specified.</summary>
        /// <returns>true if successful; otherwise, false.</returns>
        /// <param name="name">The name of the property.</param>
        /// <param name="value">The new value of the property.</param>
        public bool TrySetPropertyValue(string name, object value)
        {
            if (name == null)
                throw new ArgumentNullException(nameof(name));
            if (!this._updatableProperties.Contains(name))
                return false;
            PropertyAccessor<TEntityType> allProperty = this._allProperties[name];
            if (value == null && !EdmLibHelpers.IsNullable(allProperty.Property.PropertyType))
                return false;
            Type propertyType = allProperty.Property.PropertyType;
            if (value != null && !propertyType.IsCollection() && !propertyType.IsAssignableFrom(value.GetType()))
                return false;
            allProperty.SetValue(this._entity, value);
            this._changedProperties.Add(name);
            return true;
        }

        /// <summary>Attempts to get the value of the property called <paramref name="name" /> from the underlying entity.</summary>
        /// <returns>true if the property was found.</returns>
        /// <param name="name">The name of the property.</param>
        /// <param name="value">The value of the property.</param>
        public bool TryGetPropertyValue(string name, out object value)
        {
            if (name == null)
                throw new ArgumentNullException(nameof(name));
            PropertyAccessor<TEntityType> propertyAccessor;
            if (this._allProperties.TryGetValue(name, out propertyAccessor))
            {
                value = propertyAccessor.GetValue(this._entity);
                return true;
            }
            value = (object)null;
            return false;
        }

        /// <summary>Attempts to get the <see cref="T:System.Type" /> of the property called <paramref name="name" /> from the underlying entity.</summary>
        /// <returns>true if the property was found; otherwise, false.</returns>
        /// <param name="name">The name of the property.</param>
        /// <param name="type">The type of the property.</param>
        public bool TryGetPropertyType(string name, out Type type)
        {
            if (name == null)
                throw new ArgumentNullException(nameof(name));
            PropertyAccessor<TEntityType> propertyAccessor;
            if (this._allProperties.TryGetValue(name, out propertyAccessor))
            {
                type = propertyAccessor.Property.PropertyType;
                return true;
            }
            type = (Type)null;
            return false;
        }

        /// <summary>Returns the <see cref="P:System.Web.Http.OData.Delta`1.EntityType" /> instance that holds all the changes (and original values) being tracked by this Delta.</summary>
        /// <returns>The <see cref="P:System.Web.Http.OData.Delta`1.EntityType" /> istance.</returns>
        public TEntityType GetEntity()
        {
            return this._entity;
        }

        /// <summary>Returns the Properties that have been modified through this Delta as an enumeration of property names.</summary>
        /// <returns>The property names.</returns>
        public IEnumerable<string> GetChangedPropertyNames()
        {
            return (IEnumerable<string>)this._changedProperties;
        }

        /// <summary>Returns the properties that have not been modified through this Delta as an enumeration of property names.</summary>
        /// <returns>The properties that have not been modified through this Delta as an enumeration of property names.</returns>
        public IEnumerable<string> GetUnchangedPropertyNames()
        {
            return this._updatableProperties.Except<string>(this.GetChangedPropertyNames());
        }

        /// <summary>Copies the changed property values from the underlying entity (accessible via <see cref="M:System.Web.Http.OData.Delta`1.GetEntity" /> to the <paramref name="original" /> entity.</summary>
        /// <param name="original">The entity to be updated.</param>
        public void CopyChangedValues(TEntityType original)
        {
            if ((object)original == null)
                throw new ArgumentNullException(nameof(original));
            if (!this._entityType.IsAssignableFrom(original.GetType()))
                throw new ArgumentNullException(nameof(original), $"DeltaTypeMismatch|{this._entityType}|{original.GetType()}");
            foreach (PropertyAccessor<TEntityType> propertyAccessor in this.GetChangedPropertyNames().Select<string, PropertyAccessor<TEntityType>>((Func<string, PropertyAccessor<TEntityType>>)(s => this._allProperties[s])).ToArray<PropertyAccessor<TEntityType>>())
                propertyAccessor.Copy(this._entity, original);
        }

        /// <summary>Copies the unchanged property values from the underlying entity (accessible via <see cref="M:System.Web.Http.OData.Delta`1.GetEntity" /> ) to the <paramref name="original" /> entity.</summary>
        /// <param name="original">The entity to be updated.</param>
        public void CopyUnchangedValues(TEntityType original)
        {
            if ((object)original == null)
                throw new ArgumentNullException(nameof(original));
            if (!this._entityType.IsAssignableFrom(original.GetType()))
                throw new ArgumentException(nameof(original), $"DeltaTypeMismatch|{this._entityType}|{original.GetType()}");
            foreach (PropertyAccessor<TEntityType> propertyAccessor in this.GetUnchangedPropertyNames().Select<string, PropertyAccessor<TEntityType>>((Func<string, PropertyAccessor<TEntityType>>)(s => this._allProperties[s])))
                propertyAccessor.Copy(this._entity, original);
        }

        /// <summary>Overwrites the <paramref name="original" /> entity with the changes tracked by this Delta.</summary>
        /// <param name="original">The entity to be updated.</param>
        public void Patch(TEntityType original)
        {
            this.CopyChangedValues(original);
        }

        /// <summary>Overwrites the <paramref name="original" /> entity with the values stored in this Delta.</summary>
        /// <param name="original">The entity to be updated.</param>
        public void Put(TEntityType original)
        {
            this.CopyChangedValues(original);
            this.CopyUnchangedValues(original);
        }

        private void Reset(Type entityType)
        {
            if (entityType == (Type)null)
                throw new ArgumentNullException(nameof(entityType));
            if (!typeof(TEntityType).IsAssignableFrom(entityType))
                throw new InvalidOperationException($"DeltaEntityTypeNotAssignable|{entityType}|{typeof(TEntityType)}");
            this._entity = Activator.CreateInstance(entityType) as TEntityType;
            this._changedProperties = new HashSet<string>();
            this._entityType = entityType;
        }

        private void InitializeProperties(IEnumerable<string> updatableProperties)
        {
            this._allProperties = Delta<TEntityType>._propertyCache.GetOrAdd(this._entityType, (Func<Type, Dictionary<string, PropertyAccessor<TEntityType>>>)(backingType => ((IEnumerable<PropertyInfo>)backingType.GetProperties()).Where<PropertyInfo>((Func<PropertyInfo, bool>)(p =>
            {
                if (p.GetSetMethod() != (MethodInfo)null || p.PropertyType.IsCollection())
                    return p.GetGetMethod() != (MethodInfo)null;
                return false;
            })).Select<PropertyInfo, PropertyAccessor<TEntityType>>((Func<PropertyInfo, PropertyAccessor<TEntityType>>)(p => (PropertyAccessor<TEntityType>)new FastPropertyAccessor<TEntityType>(p))).ToDictionary<PropertyAccessor<TEntityType>, string>((Func<PropertyAccessor<TEntityType>, string>)(p => p.Property.Name))));
            if (updatableProperties != null)
            {
                this._updatableProperties = new HashSet<string>(updatableProperties);
                this._updatableProperties.IntersectWith((IEnumerable<string>)this._allProperties.Keys);
            }
            else
                this._updatableProperties = new HashSet<string>((IEnumerable<string>)this._allProperties.Keys);
        }
    }
}
