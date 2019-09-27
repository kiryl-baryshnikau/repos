using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace BD.MedView.Services.Services
{
    public class EntityLinkEvent<T,R> where T : class where R: class
    {
        public T Left { get; private set; }
        public R Right { get; private set; }
        public bool Link { get; private set; }
        public Expression<Func<T, ICollection<R>>> Expression { get; private set; }

        public EntityLinkEvent(T left, R right, bool link, Expression<Func<T, ICollection<R>>> expression)
        {
            Left = left;
            Right = right;
            Link = link;
            Expression = expression;
        }
    }
}